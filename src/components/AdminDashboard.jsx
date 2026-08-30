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
} from './dashboard/ui';

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
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, donationsRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/donations'),
        api.get('/admin/requests'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
      setRequests(requestsRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleVerify = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { is_verified: !currentStatus });
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: !currentStatus } : u))
      );
    } catch {
      toast.error('Failed to update user');
    }
  };

  const donors = users.filter((u) => u.role === 'DONOR').length;
  const ngos = users.filter((u) => u.role === 'NGO').length;
  const activeDonations = donations.filter((d) => d.status === 'AVAILABLE').length;
  const completedDonations = donations.filter((d) => d.status === 'COMPLETED').length;
  const unverified = users.filter((u) => u.role !== 'ADMIN' && !u.is_verified).length;

  // Counts come from /admin/stats so the tiles stay right even once the
  // list endpoints are paginated.
  const overviewStats = [
    {
      label: 'Total users',
      value: stats?.total_users ?? users.length,
      sub: `${donors} donors · ${ngos} NGOs`,
    },
    { label: 'Active donations', value: activeDonations, sub: 'Available now' },
    {
      label: 'Total donations',
      value: stats?.total_donations ?? donations.length,
      sub: `${stats?.total_requests ?? requests.length} requests`,
    },
    {
      label: 'Completed',
      value: stats?.completed_donations ?? completedDonations,
      sub: 'Fully delivered',
    },
  ];

  const nav = [
    { key: 'overview', icon: 'grid_view', label: 'Overview' },
    { key: 'users', icon: 'group', label: 'Users', badge: unverified },
    { key: 'donations', icon: 'inventory_2', label: 'Donations' },
    { key: 'requests', icon: 'list_alt', label: 'Requests' },
  ].map((t) => ({ ...t, active: activeTab === t.key, onClick: () => setActiveTab(t.key) }));

  const titles = {
    overview: 'System overview',
    users: 'Users',
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
      {activeTab === 'overview' && (
        <>
          <StatBand items={overviewStats} loading={loading} />

          <div className="grid gap-5 lg:grid-cols-3">
            <Panel className="lg:col-span-2 overflow-hidden">
              <PanelHead title="Recent users">
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-[12.5px] font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  View all
                </button>
              </PanelHead>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : (
                <Table head={['User', 'Role', 'Verified', 'Joined']}>
                  {users.slice(0, 5).map((u) => (
                    <tr key={u.id}>
                      <Td>
                        <UserCell user={u} />
                      </Td>
                      <Td>
                        <RoleTag role={u.role} />
                      </Td>
                      <Td>
                        <StatusPill status={u.is_verified ? 'APPROVED' : 'PENDING'} />
                      </Td>
                      <Td className="numeric text-ink-faint dark:text-white/30">
                        {new Date(u.created_at).toLocaleDateString()}
                      </Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>

            <Panel className="overflow-hidden">
              <PanelHead title="Recent requests">
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-[12.5px] font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  View all
                </button>
              </PanelHead>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <p className="px-5 py-10 text-center text-[12.5px] text-ink-faint dark:text-white/30">
                  No requests yet
                </p>
              ) : (
                <ul className="divide-y divide-brand-line dark:divide-night-line">
                  {requests.slice(0, 5).map((r, i) => (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-5 py-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12.5px] font-semibold text-brand-green dark:text-white leading-snug truncate">
                          {r.ngo_name} &rarr; {r.food_type}
                        </p>
                        <StatusPill status={r.status} />
                      </div>
                      <p className="numeric mt-1 text-[11.5px] text-ink-faint dark:text-white/30">
                        {r.donor_name} · {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}

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
            <Table head={['User', 'Role', 'Joined', 'Verified', '']}>
              {users.map((u) => (
                <tr key={u.id}>
                  <Td>
                    <UserCell user={u} />
                  </Td>
                  <Td>
                    <RoleTag role={u.role} />
                  </Td>
                  <Td className="numeric text-ink-faint dark:text-white/30">
                    {new Date(u.created_at).toLocaleDateString()}
                  </Td>
                  <Td>
                    <StatusPill status={u.is_verified ? 'APPROVED' : 'PENDING'} />
                  </Td>
                  <Td>
                    {u.role !== 'ADMIN' && (
                      <Button
                        variant={u.is_verified ? 'danger' : 'ghost'}
                        size="sm"
                        onClick={() => handleVerify(u.id, u.is_verified)}
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
    </DashboardLayout>
  );
}
