import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../api';
import socket from '../socket';
import DashboardLayout from './dashboard/Layout';
import {
  Button,
  EmptyState,
  Field,
  IconButton,
  OtpTiles,
  Panel,
  SectionHead,
  Skeleton,
  StatBand,
  StatusPill,
  StatusRail,
} from './dashboard/ui';
import { inputClass } from './dashboard/tokens';

function expiryLabel(createdAt, bestBefore) {
  const expiry = new Date(new Date(createdAt).getTime() + bestBefore * 3600000);
  const h = (expiry - Date.now()) / 3600000;
  if (h < 0) return { text: 'Expired', cls: 'text-red-600 dark:text-red-300' };
  if (h < 2) return { text: Math.round(h * 60) + 'm left', cls: 'text-red-600 dark:text-red-300' };
  if (h < 24) return { text: Math.round(h) + 'h left', cls: 'text-primary' };
  return { text: Math.round(h / 24) + 'd left', cls: 'text-brand-emerald' };
}

export default function NGODashboard() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [available, setAvailable] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [activeSection, setActiveSection] = useState('browse');
  const [alreadyRequested, setAlreadyRequested] = useState(new Set());
  const [volunteerModal, setVolunteerModal] = useState(null); // holds request object
  const [volunteerForm, setVolunteerForm] = useState({
    volunteer_name: '',
    volunteer_phone: '',
    vehicle_type: 'Two-Wheeler',
    vehicle_number: '',
  });
  const [submittingVolunteer, setSubmittingVolunteer] = useState(false);
  const isVerified = user.is_verified !== false;

  const fetchData = useCallback(async () => {
    try {
      const [availRes, reqRes] = await Promise.all([
        api.get('/donations/available'),
        api.get('/requests/mine'),
      ]);
      setAvailable(availRes.data);
      setMyRequests(reqRes.data);
      // track which donation IDs this NGO already requested
      const ids = new Set(reqRes.data.map((r) => r.donation_id));
      setAlreadyRequested(ids);
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
    const onAvailable = ({ donation }) => {
      setAvailable((prev) => {
        if (prev.some((d) => d.id === donation.id)) return prev;
        return [donation, ...prev];
      });
      toast.info(`New donation: ${donation.food_type}`);
    };
    const onResolved = ({ request, status, otp }) => {
      setMyRequests((prev) =>
        prev.map((r) => {
          if (r.id !== request.id) return r;
          return { ...r, ...request, status, otp: otp ?? r.otp };
        })
      );
      if (otp) {
        toast.success(`OTP issued: ${otp}`);
      } else {
        toast.info(`Request ${status.toLowerCase()}`);
      }
    };
    const onCollected = ({ donation, request }) => {
      setMyRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, otp_verified: true } : r))
      );
      setAvailable((prev) => prev.filter((d) => d.id !== donation.id));
      toast.success('Pickup confirmed');
    };
    const onConnect = () => {
      fetchData();
    };

    socket.on('donation:available', onAvailable);
    socket.on('request:resolved', onResolved);
    socket.on('pickup:collected', onCollected);
    socket.on('connect', onConnect);

    return () => {
      socket.off('donation:available', onAvailable);
      socket.off('request:resolved', onResolved);
      socket.off('pickup:collected', onCollected);
      socket.off('connect', onConnect);
    };
  }, [fetchData]);

  const pendingCount = myRequests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = myRequests.filter((r) => r.status === 'APPROVED').length;

  const stats = [
    { label: 'Available food', value: available.length },
    { label: 'Requests sent', value: myRequests.length },
    { label: 'Approved', value: approvedCount },
    { label: 'Pending', value: pendingCount },
  ];

  const handleRequest = async (donationId) => {
    setRequesting(donationId);
    try {
      await api.post('/requests', { donation_id: donationId });
      toast.success('Request sent successfully!');
      await fetchData();
      setActiveSection('requests');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Request failed');
    } finally {
      setRequesting(null);
    }
  };

  const handleAssignVolunteer = async (e) => {
    e.preventDefault();
    setSubmittingVolunteer(true);
    try {
      await api.put(`/requests/${volunteerModal.id}/volunteer`, volunteerForm);
      toast.success('Volunteer assigned! OTP generated.');
      setVolunteerModal(null);
      setVolunteerForm({
        volunteer_name: '',
        volunteer_phone: '',
        vehicle_type: 'Two-Wheeler',
        vehicle_number: '',
      });
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign volunteer');
    } finally {
      setSubmittingVolunteer(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const nav = [
    {
      key: 'browse',
      icon: 'restaurant_menu',
      label: 'Browse food',
      active: activeSection === 'browse',
      badge: loading ? 0 : available.length,
      onClick: () => setActiveSection('browse'),
    },
    {
      key: 'requests',
      icon: 'list_alt',
      label: 'My requests',
      active: activeSection === 'requests',
      badge: pendingCount,
      onClick: () => setActiveSection('requests'),
    },
    { key: 'history', to: '/history', icon: 'history', label: 'History' },
    { key: 'profile', to: '/profile', icon: 'person', label: 'Profile' },
    { key: 'site', to: '/', icon: 'home', label: 'Back to site' },
  ];

  return (
    <DashboardLayout
      label="NGO"
      nav={nav}
      user={user}
      avatarFallback="NGO"
      title={`${greeting}, ${(user.name || 'NGO').split(' ')[0]}`}
      subtitle="Claim surplus nearby and coordinate your volunteers."
      actions={
        <>
          {!loading && (
            <span className="hidden sm:inline-flex items-center gap-2 h-10 px-3.5 rounded-lg bg-brand-mint dark:bg-brand-emerald/15 text-brand-moss dark:text-brand-emerald text-[12px] font-bold">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-70 animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-emerald" />
              </span>
              <span className="numeric">{available.length}</span> live
            </span>
          )}
          <IconButton icon="refresh" onClick={fetchData} aria-label="Refresh" />
        </>
      }
    >
      {!isVerified && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft dark:bg-primary/10 p-5">
          <p className="text-[13.5px] font-bold text-primary">Awaiting admin verification</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft dark:text-white/45">
            You can browse what is available, but claiming is locked until an admin verifies your
            organisation. This usually takes 24&ndash;48 hours.
          </p>
        </div>
      )}

      <StatBand items={stats} loading={loading} />

      {activeSection === 'browse' && (
        <section>
          <SectionHead title="Available donations" count={available.length} />

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : available.length === 0 ? (
            <EmptyState
              icon="restaurant"
              title="Nothing available right now"
              hint="Donors list new surplus throughout the day — check back shortly."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {available.map((d, i) => {
                  const exp = expiryLabel(d.created_at, d.best_before);
                  const alreadySent = alreadyRequested.has(d.id);
                  return (
                    <motion.article
                      key={d.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex flex-col rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line p-5 transition-shadow hover:shadow-lift"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[15px] font-bold text-brand-green dark:text-white leading-snug">
                          {d.food_type}
                        </h3>
                        <span className={`numeric shrink-0 text-[11.5px] font-bold ${exp.cls}`}>
                          {exp.text}
                        </span>
                      </div>

                      {d.notes && (
                        <p className="mt-2 text-[12.5px] text-ink-soft dark:text-white/40 line-clamp-2">
                          {d.notes}
                        </p>
                      )}

                      <dl className="mt-4 flex-1 space-y-1.5 text-[12.5px]">
                        {[
                          ['Quantity', d.quantity],
                          ['Donor', d.donor_name],
                          ['Address', d.address],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-3">
                            <dt className="text-ink-faint dark:text-white/30 shrink-0">{k}</dt>
                            <dd className="font-semibold text-ink dark:text-white/70 truncate text-right">
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      {alreadySent ? (
                        <div className="mt-5 h-10 grid place-items-center rounded-lg bg-brand-cream-soft dark:bg-white/5 text-[12.5px] font-bold text-ink-faint dark:text-white/35">
                          Request sent
                        </div>
                      ) : (
                        <Button
                          className="w-full mt-5"
                          onClick={() => handleRequest(d.id)}
                          disabled={requesting === d.id || !isVerified}
                          title={isVerified ? undefined : 'Awaiting admin verification'}
                        >
                          {requesting === d.id
                            ? 'Sending…'
                            : isVerified
                              ? 'Request this food'
                              : 'Verification required'}
                        </Button>
                      )}
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      {activeSection === 'requests' && (
        <section>
          <SectionHead title="My requests" count={myRequests.length}>
            {pendingCount > 0 && (
              <span className="numeric text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                {pendingCount} pending
              </span>
            )}
          </SectionHead>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : myRequests.length === 0 ? (
            <EmptyState icon="list_alt" title="No requests yet">
              <button
                onClick={() => setActiveSection('browse')}
                className="text-[13px] font-bold text-primary hover:text-primary-hover"
              >
                Browse available food &rarr;
              </button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req, i) => (
                <motion.article
                  key={req.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden"
                >
                  <div className="flex">
                    <StatusRail status={req.status} />
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-brand-green dark:text-white">
                            {req.food_type}
                          </h3>
                          <p className="mt-0.5 text-[12.5px] text-ink-soft dark:text-white/40">
                            {req.quantity} · from {req.donor_name}
                          </p>
                        </div>
                        <StatusPill status={req.status} />
                      </div>

                      <p className="numeric mt-3 text-[11.5px] text-ink-faint dark:text-white/30">
                        {req.address} · {new Date(req.created_at).toLocaleDateString()}{' '}
                        {new Date(req.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {req.status === 'APPROVED' &&
                        (req.volunteer_name ? (
                          <Panel tone="sunken" className="mt-4 p-4">
                            <p className="numeric text-[9.5px] uppercase tracking-[0.16em] font-bold text-brand-moss dark:text-brand-emerald">
                              Volunteer assigned
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

                            <div className="mt-4 pt-4 border-t border-brand-line dark:border-night-line flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="text-[12px] font-bold text-brand-green dark:text-white">
                                  Pickup code
                                </p>
                                <p className="mt-0.5 text-[11.5px] text-ink-soft dark:text-white/35">
                                  Share it with your volunteer only.
                                </p>
                              </div>
                              <OtpTiles value={String(req.otp ?? '')} />
                            </div>
                          </Panel>
                        ) : (
                          <Button
                            className="mt-4"
                            onClick={() => {
                              setVolunteerModal(req);
                              setVolunteerForm({
                                volunteer_name: '',
                                volunteer_phone: '',
                                vehicle_type: 'Two-Wheeler',
                                vehicle_number: '',
                              });
                            }}
                          >
                            Assign volunteer
                          </Button>
                        ))}

                      {req.status === 'REJECTED' && (
                        <p className="mt-4 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-[12.5px] font-semibold">
                          <span className="material-symbols-outlined text-[17px]">cancel</span>
                          The donor did not approve this request.
                        </p>
                      )}

                      {req.status === 'PENDING' && (
                        <p className="mt-4 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-primary-soft dark:bg-primary/10 text-primary text-[12.5px] font-semibold">
                          <span className="material-symbols-outlined text-[17px]">hourglass_top</span>
                          Waiting for donor approval.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Volunteer assignment */}
      <AnimatePresence>
        {volunteerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-brand-green/70 dark:bg-night/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setVolunteerModal(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden"
            >
              <div className="px-6 h-16 flex items-center justify-between border-b border-brand-line dark:border-night-line">
                <div>
                  <h3 className="text-[15px] font-bold text-brand-green dark:text-white">
                    Assign volunteer
                  </h3>
                  <p className="text-[12px] text-ink-soft dark:text-white/40">
                    {volunteerModal.food_type}
                  </p>
                </div>
                <IconButton
                  icon="close"
                  onClick={() => setVolunteerModal(null)}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={handleAssignVolunteer} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name">
                    <input
                      type="text"
                      required
                      value={volunteerForm.volunteer_name}
                      onChange={(e) =>
                        setVolunteerForm((p) => ({ ...p, volunteer_name: e.target.value }))
                      }
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      type="tel"
                      required
                      value={volunteerForm.volunteer_phone}
                      onChange={(e) =>
                        setVolunteerForm((p) => ({ ...p, volunteer_phone: e.target.value }))
                      }
                      placeholder="10-digit number"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Vehicle type">
                  <select
                    value={volunteerForm.vehicle_type}
                    onChange={(e) =>
                      setVolunteerForm((p) => ({ ...p, vehicle_type: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option>Two-Wheeler</option>
                    <option>Three-Wheeler (Auto)</option>
                    <option>Four-Wheeler (Car)</option>
                    <option>Minivan / Tempo</option>
                    <option>Truck</option>
                    <option>On Foot</option>
                  </select>
                </Field>

                <Field label="Vehicle number">
                  <input
                    type="text"
                    required
                    value={volunteerForm.vehicle_number}
                    onChange={(e) =>
                      setVolunteerForm((p) => ({ ...p, vehicle_number: e.target.value }))
                    }
                    placeholder="e.g. DL 01 AB 1234"
                    className={`${inputClass} uppercase`}
                  />
                </Field>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-cream dark:bg-night-soft">
                  <OtpTiles value="" tone="soft" />
                  <p className="text-[12px] leading-relaxed text-ink-soft dark:text-white/45">
                    A 4-digit code is generated on assignment and shown to the donor. Your volunteer
                    must quote it to complete the pickup.
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setVolunteerModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submittingVolunteer}>
                    {submittingVolunteer ? 'Assigning…' : 'Assign & generate code'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
