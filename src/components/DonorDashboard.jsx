import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../api';
import socket from '../socket';
import DashboardLayout from './dashboard/Layout';
import {
  Button,
  EmptyState,
  IconButton,
  OtpInput,
  Panel,
  SectionHead,
  Skeleton,
  StatBand,
  StatusPill,
  StatusRail,
} from './dashboard/ui';

function expiryTime(createdAt, bestBefore) {
  return new Date(new Date(createdAt).getTime() + bestBefore * 3600000);
}

function expiryTone(createdAt, bestBefore) {
  const h = (expiryTime(createdAt, bestBefore) - Date.now()) / 3600000;
  if (h < 2) return 'text-red-600 dark:text-red-300';
  if (h < 6) return 'text-primary';
  return 'text-brand-emerald';
}

export default function DonorDashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({}); // { requestId: otpValue }
  const [verifyingOtp, setVerifyingOtp] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        api.get('/donations/mine'),
        api.get('/requests/incoming'),
      ]);
      setDonations(donationsRes.data);
      setRequests(requestsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      })
      .catch(() => {});
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const onIncoming = ({ request, donation }) => {
      setRequests((prev) => {
        if (prev.some((r) => r.id === request.id)) return prev;
        const enriched = {
          ...request,
          food_type: donation.food_type,
          quantity: donation.quantity,
          address: donation.address,
        };
        return [enriched, ...prev];
      });
      toast.info(`New request for ${donation.food_type}`);
    };
    const onCollected = ({ donation, request }) => {
      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, otp_verified: true, status: 'APPROVED' } : r))
      );
      setDonations((prev) =>
        prev.map((d) => (d.id === donation.id ? { ...d, status: 'COLLECTED' } : d))
      );
      toast.success('Pickup confirmed');
    };
    const onConnect = () => {
      fetchData();
    };

    socket.on('request:incoming', onIncoming);
    socket.on('pickup:collected', onCollected);
    socket.on('connect', onConnect);

    return () => {
      socket.off('request:incoming', onIncoming);
      socket.off('pickup:collected', onCollected);
      socket.off('connect', onConnect);
    };
  }, [fetchData]);

  const activeDonations = donations.filter((d) => d.status === 'AVAILABLE').length;
  const approvedReqs = requests.filter((r) => r.status === 'APPROVED').length;
  const pendingReqs = requests.filter((r) => r.status === 'PENDING').length;

  const stats = [
    { label: 'Total donations', value: donations.length },
    { label: 'Active listings', value: activeDonations },
    { label: 'Approved', value: approvedReqs },
    { label: 'Pending', value: pendingReqs },
  ];

  const handleAction = async (requestId, action) => {
    try {
      await api.put(`/requests/${requestId}`, { action });
      toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'}!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const handleDelete = async (donationId) => {
    try {
      await api.delete(`/donations/${donationId}`);
      setDonations((prev) => prev.filter((d) => d.id !== donationId));
      toast.success('Donation removed.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete');
    }
  };

  const handleRelease = async (donationId) => {
    try {
      await api.put(`/donations/${donationId}/release`);
      toast.success('Claim released. The listing is open again.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not release claim');
    }
  };

  const handleStatusUpdate = async (donationId, status) => {
    try {
      await api.put(`/donations/${donationId}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleVerifyOtp = async (requestId) => {
    const otp = otpInputs[requestId];
    if (!otp || otp.length < 4) return toast.error('Enter 4-digit OTP');
    setVerifyingOtp(requestId);
    try {
      await api.post(`/requests/${requestId}/verify-otp`, { otp });
      toast.success('OTP verified! Food marked as collected.');
      setOtpInputs((prev) => ({ ...prev, [requestId]: '' }));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setVerifyingOtp(null);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const nav = [
    { key: 'home', to: '/donor-dashboard', icon: 'grid_view', label: 'Dashboard', active: true },
    { key: 'new', to: '/create-donation', icon: 'add_circle', label: 'Donate food' },
    { key: 'history', to: '/history', icon: 'history', label: 'History' },
    { key: 'profile', to: '/profile', icon: 'person', label: 'Profile' },
    { key: 'site', to: '/', icon: 'home', label: 'Back to site' },
  ];

  return (
    <DashboardLayout
      label="Donor"
      nav={nav}
      user={user}
      avatarFallback="Donor"
      title={`${greeting}, ${(user.name || 'Donor').split(' ')[0]}`}
      subtitle="Your listings and the requests they attracted."
      actions={
        <>
          <IconButton icon="refresh" onClick={fetchData} aria-label="Refresh" />
          <Link
            to="/create-donation"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-[12.5px] font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            New donation
          </Link>
        </>
      }
    >
      <StatBand items={stats} loading={loading} />

      {/* My donations */}
      <section>
        <SectionHead title="My donations" count={donations.length}>
          <Link
            to="/create-donation"
            className="text-[12.5px] font-bold text-primary hover:text-primary-hover transition-colors"
          >
            Add new
          </Link>
        </SectionHead>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : donations.length === 0 ? (
          <EmptyState icon="restaurant" title="No donations yet" hint="Your listings will show up here.">
            <Link
              to="/create-donation"
              className="text-[13px] font-bold text-primary hover:text-primary-hover"
            >
              Create your first &rarr;
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnimatePresence>
              {donations.map((d, i) => {
                const expiry = expiryTime(d.created_at, d.best_before);
                const pendingCount = parseInt(d.pending_requests || 0);
                return (
                  <motion.article
                    key={d.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative flex flex-col rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden transition-shadow hover:shadow-lift"
                  >
                    <div className="flex">
                      <StatusRail status={d.status} />
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[15px] font-bold text-brand-green dark:text-white leading-snug">
                            {d.food_type}
                          </h3>
                          <StatusPill status={d.status} />
                        </div>

                        <p className="mt-1 text-[12.5px] text-ink-soft dark:text-white/40">
                          {d.quantity}
                        </p>

                        <dl className="mt-4 space-y-1.5 text-[12px]">
                          <div className="flex justify-between gap-3">
                            <dt className="text-ink-faint dark:text-white/30">Best before</dt>
                            <dd
                              className={`numeric font-bold ${expiryTone(d.created_at, d.best_before)}`}
                            >
                              {expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-ink-faint dark:text-white/30">Pickup</dt>
                            <dd className="text-ink-soft dark:text-white/45 truncate max-w-[60%] text-right">
                              {d.address}
                            </dd>
                          </div>
                          {pendingCount > 0 && (
                            <div className="flex justify-between gap-3">
                              <dt className="text-ink-faint dark:text-white/30">Requests</dt>
                              <dd className="numeric font-bold text-primary">
                                {pendingCount} pending
                              </dd>
                            </div>
                          )}
                        </dl>

                        {d.status === 'AVAILABLE' && (
                          <Button
                            variant="danger"
                            className="w-full mt-4"
                            onClick={() => handleDelete(d.id)}
                          >
                            Remove listing
                          </Button>
                        )}
                        {d.status === 'CLAIMED' && (
                          <>
                            <p className="mt-4 text-[11.5px] leading-relaxed text-ink-faint dark:text-white/30">
                              Waiting on the volunteer&rsquo;s code. Enter it under Incoming
                              requests to complete the pickup.
                            </p>
                            <Button
                              variant="ghost"
                              className="w-full mt-3"
                              onClick={() => handleRelease(d.id)}
                            >
                              Release claim
                            </Button>
                          </>
                        )}
                        {d.status === 'COLLECTED' && (
                          <Button
                            variant="forest"
                            className="w-full mt-4"
                            onClick={() => handleStatusUpdate(d.id, 'COMPLETED')}
                          >
                            Mark complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Incoming requests */}
      <section>
        <SectionHead title="Incoming requests" count={requests.length}>
          {pendingReqs > 0 && (
            <span className="numeric text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
              {pendingReqs} awaiting you
            </span>
          )}
        </SectionHead>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState title="No requests yet" hint="NGOs near you will appear here when they claim a listing." />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {requests.map((req, i) => (
                <motion.article
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden"
                >
                  <div className="flex">
                    <StatusRail status={req.status} />
                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="grid place-items-center size-8 shrink-0 rounded-full bg-brand-mint dark:bg-white/10 text-[12px] font-bold text-brand-moss dark:text-white">
                              {(req.ngo_name || 'N')[0]}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[14px] font-bold text-brand-green dark:text-white truncate">
                                {req.ngo_name}
                              </span>
                              <span className="numeric block text-[11.5px] text-ink-faint dark:text-white/30">
                                {new Date(req.created_at).toLocaleDateString()} ·{' '}
                                {new Date(req.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </span>
                            <StatusPill status={req.status} />
                          </div>

                          <p className="mt-3 text-[13px] text-ink-soft dark:text-white/50">
                            Requesting{' '}
                            <span className="font-bold text-brand-green dark:text-white">
                              {req.food_type}
                            </span>{' '}
                            · {req.quantity}
                          </p>
                          <p className="mt-0.5 text-[12px] text-ink-faint dark:text-white/30">
                            {req.address}
                          </p>
                        </div>

                        {req.status === 'PENDING' && (
                          <div className="flex gap-2 shrink-0">
                            <Button variant="ghost" onClick={() => handleAction(req.id, 'REJECT')}>
                              Reject
                            </Button>
                            <Button onClick={() => handleAction(req.id, 'APPROVE')}>Approve</Button>
                          </div>
                        )}
                      </div>

                      {req.status === 'APPROVED' && req.volunteer_name && !req.otp_verified && (
                        <Panel tone="sunken" className="mt-4 p-4">
                          <p className="numeric text-[9.5px] uppercase tracking-[0.16em] text-primary font-bold">
                            Volunteer en route
                          </p>

                          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
                            {[
                              ['Name', req.volunteer_name],
                              ['Phone', req.volunteer_phone],
                              ['Vehicle', req.vehicle_type],
                              ['Number', req.vehicle_number],
                            ].map(([k, v]) => (
                              <div key={k} className="flex gap-2 min-w-0">
                                <dt className="text-ink-faint dark:text-white/30 shrink-0">{k}</dt>
                                <dd className="font-semibold text-ink dark:text-white/75 truncate">
                                  {v}
                                </dd>
                              </div>
                            ))}
                          </dl>

                          <div className="mt-4 pt-4 border-t border-brand-line dark:border-night-line flex flex-wrap items-end justify-between gap-4">
                            <div>
                              <p className="text-[12px] font-bold text-brand-green dark:text-white">
                                Enter the volunteer&rsquo;s code
                              </p>
                              <p className="mt-0.5 text-[11.5px] text-ink-soft dark:text-white/35">
                                The pickup only completes when it matches.
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <OtpInput
                                value={otpInputs[req.id] || ''}
                                onChange={(v) =>
                                  setOtpInputs((prev) => ({ ...prev, [req.id]: v }))
                                }
                                disabled={verifyingOtp === req.id}
                              />
                              <Button
                                onClick={() => handleVerifyOtp(req.id)}
                                disabled={verifyingOtp === req.id}
                              >
                                {verifyingOtp === req.id ? 'Verifying…' : 'Confirm'}
                              </Button>
                            </div>
                          </div>
                        </Panel>
                      )}

                      {req.status === 'APPROVED' && req.otp_verified && (
                        <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-brand-mint dark:bg-brand-emerald/10 text-brand-moss dark:text-brand-emerald">
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <p className="text-[12.5px] font-semibold">
                            Collected — {req.volunteer_name} picked this up.
                          </p>
                        </div>
                      )}

                      {req.status === 'APPROVED' && !req.volunteer_name && (
                        <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-primary-soft dark:bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                          <p className="text-[12.5px] font-semibold">
                            Waiting for the NGO to assign a volunteer.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
