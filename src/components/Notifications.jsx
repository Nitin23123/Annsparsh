import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AppPage from './dashboard/AppPage';
import { EmptyState, Skeleton } from './dashboard/ui';

const RAILS = {
  emerald: 'bg-brand-emerald',
  primary: 'bg-primary',
  muted: 'bg-brand-line dark:bg-white/15',
  danger: 'bg-red-500',
};

function relative(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// There is no notifications table, so the feed is derived from the request
// records the user can already see. Same source of truth as the dashboards.
function toDonorFeed(requests) {
  return requests.map((r) => {
    if (r.otp_verified) {
      return {
        id: r.id,
        tone: 'emerald',
        title: 'Pickup completed',
        body: `${r.volunteer_name || 'A volunteer'} collected ${r.food_type}.`,
        at: r.created_at,
      };
    }
    if (r.status === 'APPROVED' && r.volunteer_name) {
      return {
        id: r.id,
        tone: 'primary',
        title: 'Volunteer on the way',
        body: `${r.volunteer_name} is collecting ${r.food_type}. Enter their code to release it.`,
        at: r.created_at,
      };
    }
    if (r.status === 'APPROVED') {
      return {
        id: r.id,
        tone: 'primary',
        title: 'Waiting on a volunteer',
        body: `${r.ngo_name} approved for ${r.food_type} but has not assigned anyone yet.`,
        at: r.created_at,
      };
    }
    if (r.status === 'REJECTED') {
      return {
        id: r.id,
        tone: 'muted',
        title: 'Request declined',
        body: `${r.ngo_name} was declined for ${r.food_type}.`,
        at: r.created_at,
      };
    }
    return {
      id: r.id,
      tone: 'primary',
      title: 'New request',
      body: `${r.ngo_name} would like to collect ${r.food_type}.`,
      at: r.created_at,
      unread: true,
    };
  });
}

function toNgoFeed(requests) {
  return requests.map((r) => {
    if (r.otp_verified) {
      return {
        id: r.id,
        tone: 'emerald',
        title: 'Pickup confirmed',
        body: `${r.food_type} from ${r.donor_name} was collected.`,
        at: r.created_at,
      };
    }
    if (r.status === 'APPROVED' && r.otp) {
      return {
        id: r.id,
        tone: 'primary',
        title: 'Code issued',
        body: `Share the pickup code for ${r.food_type} with your volunteer.`,
        at: r.created_at,
        unread: true,
      };
    }
    if (r.status === 'APPROVED') {
      return {
        id: r.id,
        tone: 'primary',
        title: 'Request approved',
        body: `${r.donor_name} approved ${r.food_type}. Assign a volunteer to get a code.`,
        at: r.created_at,
        unread: true,
      };
    }
    if (r.status === 'REJECTED') {
      return {
        id: r.id,
        tone: 'danger',
        title: 'Request declined',
        body: `${r.donor_name} declined your request for ${r.food_type}.`,
        at: r.created_at,
      };
    }
    return {
      id: r.id,
      tone: 'muted',
      title: 'Awaiting approval',
      body: `Your request for ${r.food_type} is with ${r.donor_name}.`,
      at: r.created_at,
    };
  });
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = JSON.parse(localStorage.getItem('user') || '{}').role;
  const isDonor = role === 'DONOR';
  const dashboard = isDonor ? '/donor-dashboard' : '/ngo-dashboard';

  // Route is behind ProtectedRoute, so role is always DONOR or NGO here.
  useEffect(() => {
    api
      .get(isDonor ? '/requests/incoming' : '/requests/mine')
      .then(({ data }) => {
        const feed = isDonor ? toDonorFeed(data) : toNgoFeed(data);
        setItems(feed.sort((a, b) => new Date(b.at) - new Date(a.at)));
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load activity'))
      .finally(() => setLoading(false));
  }, [isDonor]);

  const unread = items.filter((n) => n.unread).length;

  return (
    <AppPage
      back={dashboard}
      backLabel="Back to dashboard"
      title="Activity"
      subtitle={unread > 0 ? `${unread} need your attention` : 'Nothing needs you right now'}
      width="max-w-2xl"
    >
      {error && (
        <p className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-[13px] font-semibold">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="notifications"
          title="Nothing yet"
          hint="Requests and pickups will show up here as they happen."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={`${n.title}-${n.id}`}
              className="flex rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden"
            >
              <span aria-hidden="true" className={`w-[3px] shrink-0 ${RAILS[n.tone]}`} />
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[14px] font-bold text-brand-green dark:text-white">
                    {n.title}
                  </h2>
                  <span className="numeric shrink-0 text-[11px] text-ink-faint dark:text-white/30">
                    {relative(n.at)}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft dark:text-white/45">
                  {n.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-[12.5px] text-ink-faint dark:text-white/30">
        Looking further back?{' '}
        <Link to="/history" className="font-bold text-primary hover:text-primary-hover">
          Open your history
        </Link>
      </p>
    </AppPage>
  );
}
