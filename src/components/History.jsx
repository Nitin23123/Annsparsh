import { useState, useEffect, useMemo } from 'react';
import api from '../api';
import AppPage from './dashboard/AppPage';
import { EmptyState, Panel, Skeleton, StatusPill, StatusRail } from './dashboard/ui';

const COMPLETED_DONATION_STATUSES = ['COLLECTED', 'COMPLETED', 'EXPIRED'];
const COMPLETED_REQUEST_STATUSES = ['REJECTED'];

function Detail({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="numeric text-[9.5px] uppercase tracking-[0.16em] text-ink-faint dark:text-white/30">
        {label}
      </dt>
      <dd className="mt-1.5 text-[13px] text-ink-soft dark:text-white/55">{children}</dd>
    </div>
  );
}

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setUserRole(user.role);
    fetchHistory(user.role);
  }, []);

  const fetchHistory = async (role) => {
    setLoading(true);
    setError('');
    try {
      const url = role === 'DONOR' ? '/donations/mine' : '/requests/mine';
      const { data } = await api.get(url);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (userRole === 'DONOR') {
      return items.filter((d) => COMPLETED_DONATION_STATUSES.includes(d.status));
    }
    return items.filter(
      (r) => COMPLETED_REQUEST_STATUSES.includes(r.status) || r.donation_status === 'COLLECTED'
    );
  }, [items, filter, userRole]);

  const isDonor = userRole === 'DONOR';
  const dashboardLink = isDonor ? '/donor-dashboard' : '/ngo-dashboard';

  return (
    <AppPage
      back={dashboardLink}
      backLabel="Back to dashboard"
      title={isDonor ? 'Donation history' : 'Request history'}
      subtitle="Everything you have listed or claimed."
      width="max-w-4xl"
      actions={
        <div className="flex gap-1 p-1 rounded-lg border border-brand-line dark:border-night-line">
          {[
            { id: 'all', label: 'All' },
            { id: 'completed', label: 'Completed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`h-8 px-3.5 rounded text-[12.5px] font-bold transition-colors ${
                filter === f.id
                  ? 'bg-brand-green dark:bg-primary text-white'
                  : 'text-ink-soft dark:text-white/50 hover:text-brand-green dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      {error && (
        <p className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-[13px] font-semibold">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="history"
          title={items.length === 0 ? 'No history yet' : 'Nothing matches this filter'}
          hint={
            isDonor ? 'Your donations will appear here.' : 'Your pickup requests will appear here.'
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden"
            >
              <div className="flex">
                <StatusRail status={item.status} />
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="numeric text-[11px] text-ink-faint dark:text-white/30">
                        #{item.id} ·{' '}
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <h2 className="mt-1.5 text-[17px] font-bold text-brand-green dark:text-white truncate">
                        {item.food_type}
                      </h2>
                    </div>
                    <StatusPill status={item.status} />
                  </div>

                  <Panel tone="sunken" className="mt-5 p-5">
                    <dl className="grid gap-5 sm:grid-cols-2">
                      {isDonor ? (
                        <>
                          <Detail label="Donation">
                            <span className="font-semibold text-ink dark:text-white/75">
                              {item.quantity}
                            </span>
                            <br />
                            {item.address}
                            {item.notes && (
                              <>
                                <br />
                                <span className="text-ink-faint dark:text-white/30">
                                  {item.notes}
                                </span>
                              </>
                            )}
                          </Detail>
                          <Detail label="Best before">
                            <span className="numeric font-semibold text-ink dark:text-white/75">
                              {item.best_before} hours
                            </span>
                            {item.pending_requests > 0 && (
                              <>
                                <br />
                                <span className="font-semibold text-primary">
                                  {item.pending_requests} pending request
                                  {item.pending_requests > 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                          </Detail>
                        </>
                      ) : (
                        <>
                          <Detail label="Donor">
                            <span className="font-semibold text-ink dark:text-white/75">
                              {item.donor_name || 'Unknown'}
                            </span>
                            <br />
                            {item.quantity} · {item.address}
                            <br />
                            <span className="text-ink-faint dark:text-white/30">
                              Donation status: {item.donation_status}
                            </span>
                          </Detail>
                          <Detail label="Volunteer">
                            {item.volunteer_name ? (
                              <>
                                <span className="font-semibold text-ink dark:text-white/75">
                                  {item.volunteer_name}
                                </span>
                                <br />
                                <span className="numeric">
                                  {item.volunteer_phone}
                                  {item.vehicle_number && ` · ${item.vehicle_number}`}
                                </span>
                                {item.otp_verified && (
                                  <>
                                    <br />
                                    <span className="font-semibold text-brand-moss dark:text-brand-emerald">
                                      Code verified — pickup confirmed
                                    </span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-ink-faint dark:text-white/30">
                                No volunteer assigned yet.
                              </span>
                            )}
                          </Detail>
                        </>
                      )}
                    </dl>
                  </Panel>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppPage>
  );
}
