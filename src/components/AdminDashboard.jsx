import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../api';
import DashboardLayout from './dashboard/Layout';
import {
  Button,
  IconButton,
  Panel,
  PanelHead,
  Skeleton,
  StatBand,
  StatusPill,
  EmptyState,
} from './dashboard/ui';
import { inputClass, textareaClass } from './dashboard/tokens';

const Th = ({ children }) => (
  <th className="numeric px-5 py-3 text-left text-[9.5px] font-medium uppercase tracking-[0.16em] text-ink-faint dark:text-white/30">
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-5 py-3.5 text-[12.5px] text-ink-soft dark:text-white/50 ${className}`}>
    {children}
  </td>
);

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-brand-line dark:border-night-line">
          <tr>
            {head.map((h) => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-line dark:divide-night-line">{children}</tbody>
      </table>
    </div>
  );
}

function UserCell({ user }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid place-items-center size-8 shrink-0 rounded-full bg-brand-mint dark:bg-white/10 text-[11.5px] font-bold text-brand-moss dark:text-white">
        {user.name[0]}
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-semibold text-brand-green dark:text-white truncate">
          {user.name}
        </span>
        <span className="block text-[11.5px] text-ink-faint dark:text-white/30 truncate">
          {user.email}
        </span>
      </span>
    </div>
  );
}

const ROLE_TONE = {
  DONOR: 'bg-primary-soft text-primary dark:bg-primary/15',
  NGO: 'bg-brand-mint text-brand-moss dark:bg-brand-emerald/15 dark:text-brand-emerald',
  ADMIN: 'bg-brand-green/10 text-brand-green dark:bg-white/10 dark:text-white/75',
};

const RoleTag = ({ role }) => (
  <span
    className={`numeric text-[9.5px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded ${ROLE_TONE[role]}`}
  >
    {role}
  </span>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification Decision Modal
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingDecision, setProcessingDecision] = useState(false);

  // Grievance Resolution Modal
  const [reportModal, setReportModal] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [disciplinaryAction, setDisciplinaryAction] = useState('NONE');
  const [processingReport, setProcessingReport] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, donationsRes, requestsRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/donations'),
        api.get('/admin/requests'),
        api.get('/reports'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
      setRequests(requestsRes.data);
      setReports(reportsRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleVerifyDecision = async (userId, decision, reason = '') => {
    setProcessingDecision(true);
    try {
      const { data } = await api.put(`/admin/users/${userId}/verification-decision`, {
        decision,
        rejection_reason: reason || undefined,
      });
      toast.success(
        decision === 'APPROVE' ? 'User verified and activated!' : 'User verification rejected.'
      );
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u)));
      setRejectModal(null);
      setRejectionReason('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update verification');
    } finally {
      setProcessingDecision(false);
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!reportModal) return;

    setProcessingReport(true);
    try {
      const { data } = await api.put(`/api/reports/${reportModal.id}/status`, {
        status: resolutionStatus,
        admin_notes: resolutionNotes,
        action: disciplinaryAction === 'REVOKE' ? 'REVOKE_VERIFICATION' : undefined,
      });

      toast.success('Grievance report updated successfully');
      setReports((prev) => prev.map((r) => (r.id === reportModal.id ? data.report : r)));
      if (disciplinaryAction === 'REVOKE') {
        fetchAll(); // refresh user status
      }
      setReportModal(null);
      setResolutionNotes('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update grievance');
    } finally {
      setProcessingReport(false);
    }
  };

  const donors = users.filter((u) => u.role === 'DONOR').length;
  const ngos = users.filter((u) => u.role === 'NGO').length;
  const activeDonations = donations.filter((d) => d.status === 'AVAILABLE').length;
  const completedDonations = donations.filter((d) => d.status === 'COMPLETED').length;
  const pendingVerificationsList = users.filter(
    (u) => u.role !== 'ADMIN' && (!u.is_verified || u.verification_status === 'PENDING_REVIEW')
  );
  const pendingReportsList = reports.filter((r) => r.status === 'PENDING');

  const overviewStats = [
    {
      label: 'Total users',
      value: stats?.total_users ?? users.length,
      sub: `${donors} donors · ${ngos} NGOs`,
    },
    {
      label: 'Pending Vetting',
      value: stats?.pending_verifications ?? pendingVerificationsList.length,
      sub: 'Need admin review',
    },
    {
      label: 'Open Grievances',
      value: stats?.pending_reports ?? pendingReportsList.length,
      sub: `${reports.length} total tickets`,
    },
    {
      label: 'Completed Meals',
      value: stats?.completed_donations ?? completedDonations,
      sub: 'Successfully handed over',
    },
  ];

  const nav = [
    { key: 'overview', icon: 'grid_view', label: 'Overview' },
    {
      key: 'verifications',
      icon: 'verified_user',
      label: 'Verifications',
      badge: pendingVerificationsList.length,
    },
    {
      key: 'grievances',
      icon: 'report_problem',
      label: 'Grievances',
      badge: pendingReportsList.length,
    },
    { key: 'users', icon: 'group', label: 'All Users' },
    { key: 'donations', icon: 'inventory_2', label: 'Donations' },
    { key: 'requests', icon: 'list_alt', label: 'Requests' },
  ].map((t) => ({ ...t, active: activeTab === t.key, onClick: () => setActiveTab(t.key) }));

  const titles = {
    overview: 'System overview',
    verifications: 'Organization & Identity Verification',
    grievances: 'Trust & Safety Grievances',
    users: 'Users Directory',
    donations: 'Donations',
    requests: 'Requests',
  };

  return (
    <DashboardLayout
      label="Admin"
      nav={[...nav, { key: 'site', to: '/', icon: 'home', label: 'Back to site' }]}
      user={JSON.parse(localStorage.getItem('user') || '{}')}
      avatarFallback="Admin"
      title={titles[activeTab]}
      subtitle={new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
      actions={<IconButton icon="refresh" onClick={fetchAll} aria-label="Refresh" />}
    >
      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <StatBand items={overviewStats} loading={loading} />

          {/* Quick Action Panels for Pending Vetting & Grievances */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Panel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-brand-green dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    verified_user
                  </span>
                  Pending Verifications ({pendingVerificationsList.length})
                </h3>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab('verifications')}>
                  View all
                </Button>
              </div>

              {pendingVerificationsList.length === 0 ? (
                <p className="text-[13px] text-ink-faint dark:text-white/40 py-4">
                  Verification queue is all caught up.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingVerificationsList.slice(0, 4).map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-lg border border-brand-line dark:border-night-line flex items-center justify-between"
                    >
                      <UserCell user={u} />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setActiveTab('verifications');
                        }}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold text-brand-green dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                  Open Grievance Tickets ({pendingReportsList.length})
                </h3>
                <Button size="sm" variant="ghost" onClick={() => setActiveTab('grievances')}>
                  View all
                </Button>
              </div>

              {pendingReportsList.length === 0 ? (
                <p className="text-[13px] text-ink-faint dark:text-white/40 py-4">
                  No open misconduct reports.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingReportsList.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-lg border border-brand-line dark:border-night-line flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-primary">
                            #REP-{r.id}
                          </span>
                          <StatusPill status={r.severity} />
                        </div>
                        <p className="text-[12.5px] font-semibold text-brand-green dark:text-white mt-1">
                          {r.category.replace('_', ' ')} • Role: {r.reported_role}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReportModal(r);
                          setResolutionStatus(r.status);
                          setResolutionNotes(r.admin_notes || '');
                          setActiveTab('grievances');
                        }}
                      >
                        Audit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* ── Tab: Verifications ── */}
      {activeTab === 'verifications' && (
        <Panel className="overflow-hidden">
          <PanelHead title={`Verification Queue (${users.filter((u) => u.role !== 'ADMIN').length})`}>
            <span className="text-[12px] text-ink-faint dark:text-white/35">
              {pendingVerificationsList.length} pending review
            </span>
          </PanelHead>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <Table head={['Entity / User', 'Role', 'Mobile Verified', 'Govt ID / Proof', 'Status', 'Actions']}>
              {users
                .filter((u) => u.role !== 'ADMIN')
                .map((u) => (
                  <tr key={u.id}>
                    <Td>
                      <UserCell user={u} />
                    </Td>
                    <Td>
                      <RoleTag role={u.role} />
                    </Td>
                    <Td>
                      {u.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[12px]">{u.phone}</span>
                          {u.phone_verified ? (
                            <span className="text-brand-moss dark:text-brand-emerald text-[14px] material-symbols-outlined" title="Phone OTP Verified">
                              check_circle
                            </span>
                          ) : (
                            <span className="text-ink-faint text-[14px] material-symbols-outlined" title="Phone Unverified">
                              schedule
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink-faint dark:text-white/30 text-[11px]">No phone</span>
                      )}
                    </Td>
                    <Td>
                      {u.id_type ? (
                        <div>
                          <span className="font-semibold text-brand-green dark:text-white block text-[11.5px]">
                            {u.id_type}
                          </span>
                          <span className="font-mono text-[11px] text-ink-soft dark:text-white/40 block">
                            {u.id_number}
                          </span>
                          {u.id_document_url && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] text-primary mt-0.5">
                              <span className="material-symbols-outlined text-[13px]">attachment</span>
                              {u.id_document_url}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink-faint dark:text-white/30 text-[11px]">Not submitted</span>
                      )}
                    </Td>
                    <Td>
                      <StatusPill status={u.verification_status || (u.is_verified ? 'VERIFIED' : 'UNVERIFIED')} />
                      {u.rejection_reason && (
                        <span className="block text-[10px] text-red-500 mt-1 max-w-[140px] truncate" title={u.rejection_reason}>
                          {u.rejection_reason}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {!u.is_verified ? (
                          <>
                            <Button
                              size="sm"
                              variant="forest"
                              onClick={() => handleVerifyDecision(u.id, 'APPROVE')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setRejectModal(u)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerifyDecision(u.id, 'REJECT', 'Revoked by admin')}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
            </Table>
          )}
        </Panel>
      )}

      {/* ── Tab: Grievances & Reports ── */}
      {activeTab === 'grievances' && (
        <Panel className="overflow-hidden">
          <PanelHead title={`Safety & Misconduct Grievances (${reports.length})`}>
            <span className="text-[12px] text-ink-faint dark:text-white/35">
              {pendingReportsList.length} pending action
            </span>
          </PanelHead>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon="verified"
                title="No grievances on record"
                hint="Platform handoffs are clear of reported incidents."
              />
            </div>
          ) : (
            <Table head={['Ticket', 'Category', 'Reported Entity', 'Severity', 'Statement', 'Status', 'Audit']}>
              {reports.map((r) => (
                <tr key={r.id}>
                  <Td className="font-mono font-bold text-primary">
                    #REP-{String(r.id).padStart(4, '0')}
                  </Td>
                  <Td>
                    <span className="font-semibold text-brand-green dark:text-white block">
                      {r.category.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-ink-faint dark:text-white/30">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-brand-green dark:text-white block">
                      {r.reported_name || 'Anonymous'}
                    </span>
                    <RoleTag role={r.reported_role} />
                  </Td>
                  <Td>
                    <StatusPill status={r.severity} />
                  </Td>
                  <Td className="max-w-xs">
                    <p className="line-clamp-2 text-[12px]" title={r.description}>
                      {r.description}
                    </p>
                  </Td>
                  <Td>
                    <StatusPill status={r.status} />
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setReportModal(r);
                        setResolutionStatus(r.status === 'PENDING' ? 'INVESTIGATING' : r.status);
                        setResolutionNotes(r.admin_notes || '');
                        setDisciplinaryAction('NONE');
                      }}
                    >
                      Audit
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}

      {/* ── Tab: All Users ── */}
      {activeTab === 'users' && (
        <Panel className="overflow-hidden">
          <PanelHead title={`All users (${users.length})`}>
            <span className="numeric text-[11.5px] text-ink-faint dark:text-white/30">
              {donors} donors · {ngos} NGOs
            </span>
          </PanelHead>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <Table head={['User', 'Role', 'Mobile', 'Status', 'Actions']}>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td>
                    <UserCell user={u} />
                  </Td>
                  <Td>
                    <RoleTag role={u.role} />
                  </Td>
                  <Td className="numeric text-ink-faint dark:text-white/30">
                    {u.phone || '—'} {u.phone_verified && '✓'}
                  </Td>
                  <Td>
                    <StatusPill status={u.is_verified ? 'VERIFIED' : 'PENDING'} />
                  </Td>
                  <Td>
                    {u.role !== 'ADMIN' && (
                      <Button
                        variant={u.is_verified ? 'danger' : 'ghost'}
                        size="sm"
                        onClick={() => handleVerifyDecision(u.id, u.is_verified ? 'REJECT' : 'APPROVE')}
                      >
                        {u.is_verified ? 'Unverify' : 'Verify'}
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}

      {/* ── Tab: Donations ── */}
      {activeTab === 'donations' && (
        <Panel className="overflow-hidden">
          <PanelHead title={`All donations (${donations.length})`}>
            <span className="numeric text-[11.5px] text-ink-faint dark:text-white/30">
              {activeDonations} active
            </span>
          </PanelHead>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <Table head={['Food', 'Donor', 'Quantity', 'Status', 'Requests', 'Created']}>
              {donations.map((d) => (
                <tr key={d.id}>
                  <Td className="font-semibold text-brand-green dark:text-white">{d.food_type}</Td>
                  <Td>{d.donor_name}</Td>
                  <Td>{d.quantity}</Td>
                  <Td>
                    <StatusPill status={d.status} />
                  </Td>
                  <Td className="numeric">{d.total_requests}</Td>
                  <Td className="numeric text-ink-faint dark:text-white/30">
                    {new Date(d.created_at).toLocaleDateString()}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}

      {/* ── Tab: Requests ── */}
      {activeTab === 'requests' && (
        <Panel className="overflow-hidden">
          <PanelHead title={`All requests (${requests.length})`} />

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <Table head={['NGO', 'Food', 'Donor', 'Status', 'Date']}>
              {requests.map((r) => (
                <tr key={r.id}>
                  <Td className="font-semibold text-brand-green dark:text-white">{r.ngo_name}</Td>
                  <Td>{r.food_type}</Td>
                  <Td>{r.donor_name}</Td>
                  <Td>
                    <StatusPill status={r.status} />
                  </Td>
                  <Td className="numeric text-ink-faint dark:text-white/30">
                    {new Date(r.created_at).toLocaleDateString()}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}

      {/* ── Modal: Rejection Reason ── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white dark:bg-night-card max-w-md w-full rounded-2xl border border-brand-line dark:border-night-line p-6 shadow-2xl">
            <h3 className="text-[17px] font-bold text-brand-green dark:text-white">
              Reject Verification for {rejectModal.name}
            </h3>
            <p className="mt-1.5 text-[13px] text-ink-soft dark:text-white/50">
              Provide a clear reason so the user can correct and re-submit valid credentials.
            </p>

            <div className="mt-4">
              <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/60 mb-1.5">
                Rejection Reason / Required Action *
              </label>
              <textarea
                rows={3}
                required
                className={textareaClass}
                placeholder="e.g. DARPAN registration certificate does not match organisation name."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setRejectModal(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={processingDecision}
                onClick={() => handleVerifyDecision(rejectModal.id, 'REJECT', rejectionReason)}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Grievance Resolution ── */}
      {reportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white dark:bg-night-card max-w-lg w-full rounded-2xl border border-brand-line dark:border-night-line p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-line dark:border-night-line">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] font-bold text-primary">
                  #REP-{String(reportModal.id).padStart(4, '0')}
                </span>
                <StatusPill status={reportModal.severity} />
              </div>
              <IconButton icon="close" onClick={() => setReportModal(null)} aria-label="Close" />
            </div>

            <div className="mt-4 space-y-4 text-[13px]">
              <div>
                <span className="text-ink-faint dark:text-white/40 block text-[11.5px] uppercase font-bold">
                  Reported Incident
                </span>
                <p className="font-semibold text-brand-green dark:text-white text-[14.5px]">
                  {reportModal.category.replace('_', ' ')} • Against {reportModal.reported_role} ({reportModal.reported_name || 'N/A'})
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-brand-cream/60 dark:bg-night-soft border border-brand-line/60 dark:border-night-line/60">
                <span className="text-ink-faint dark:text-white/40 block text-[11px] font-semibold uppercase mb-1">
                  Incident Statement
                </span>
                <p className="text-ink dark:text-white/90 whitespace-pre-line leading-relaxed">
                  {reportModal.description}
                </p>
              </div>

              <form onSubmit={handleUpdateReport} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/60 mb-1">
                    Update Resolution Status
                  </label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="INVESTIGATING">INVESTIGATING (Under Review)</option>
                    <option value="RESOLVED">RESOLVED (Action Taken)</option>
                    <option value="DISMISSED">DISMISSED (Invalid / Unsubstantiated)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/60 mb-1">
                    Admin Resolution Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Document investigation outcome, donor contact, or corrective measures taken."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className={textareaClass}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/60 mb-1">
                    Disciplinary Enforcement
                  </label>
                  <select
                    value={disciplinaryAction}
                    onChange={(e) => setDisciplinaryAction(e.target.value)}
                    className={inputClass}
                  >
                    <option value="NONE">No disciplinary account action</option>
                    <option value="REVOKE">Revoke Verification & Suspend Account</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => setReportModal(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" loading={processingReport}>
                    Save Resolution
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
