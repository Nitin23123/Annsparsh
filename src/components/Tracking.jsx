import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import AppPage from './dashboard/AppPage';
import { EmptyState, OtpTiles, Panel, Skeleton, StatusPill } from './dashboard/ui';

// The four states a request actually moves through, derived from the record
// itself rather than a hardcoded timeline.
function buildSteps(r) {
  const requested = { title: 'Request submitted', at: r.created_at, done: true };
  const approved = {
    title: r.status === 'REJECTED' ? 'Request declined' : 'Request approved',
    at: null,
    done: r.status === 'APPROVED' || r.status === 'REJECTED',
  };
  const assigned = {
    title: 'Volunteer assigned',
    at: null,
    done: Boolean(r.volunteer_name),
    detail: r.volunteer_name
      ? `${r.volunteer_name} · ${r.vehicle_type} ${r.vehicle_number || ''}`.trim()
      : 'The NGO has not assigned anyone yet.',
  };
  const collected = {
    title: 'Collected',
    at: null,
    done: Boolean(r.otp_verified),
    detail: r.otp_verified ? 'Code verified at the door.' : 'Waiting on the 4-digit code.',
  };
  return [requested, approved, assigned, collected];
}

export default function Tracking() {
  const [params] = useSearchParams();
  const requestId = params.get('request');

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDonor = user.role === 'DONOR';
  const dashboard = isDonor ? '/donor-dashboard' : '/ngo-dashboard';

  // Route is behind ProtectedRoute, so role is always DONOR or NGO here.
  useEffect(() => {
    api
      .get(isDonor ? '/requests/incoming' : '/requests/mine')
      .then(({ data }) => {
        const active =
          (requestId && data.find((r) => String(r.id) === String(requestId))) ||
          data.find((r) => r.status === 'APPROVED' && !r.otp_verified) ||
          data[0] ||
          null;
        setRequest(active);
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load this pickup'))
      .finally(() => setLoading(false));
  }, [requestId, isDonor]);

  return (
    <AppPage
      back={dashboard}
      backLabel="Back to dashboard"
      title="Track pickup"
      subtitle={request ? `Request #${request.id}` : 'Live handover status'}
      width="max-w-2xl"
    >
      {loading ? (
        <Skeleton className="h-80" />
      ) : error ? (
        <p className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-[13px] font-semibold">
          {error}
        </p>
      ) : !request ? (
        <EmptyState
          icon="local_shipping"
          title="Nothing to track"
          hint="Once a request is approved it will show up here."
        >
          <Link to={dashboard} className="text-[13px] font-bold text-primary hover:text-primary-hover">
            Back to dashboard &rarr;
          </Link>
        </EmptyState>
      ) : (
        <Panel className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-brand-line dark:border-night-line">
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold text-brand-green dark:text-white">
                {request.food_type}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-ink-soft dark:text-white/45">
                {request.quantity} · {isDonor ? request.ngo_name : request.donor_name}
              </p>
            </div>
            <StatusPill status={request.status} />
          </div>

          <ol className="mt-8 relative">
            <span
              aria-hidden="true"
              className="absolute left-[7px] top-2 bottom-2 w-px bg-brand-line dark:bg-night-line"
            />
            {buildSteps(request).map((step, i) => (
              <li key={i} className="relative flex gap-5 pb-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className={`relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full border-[3px] border-white dark:border-night-card ${
                    step.done ? 'bg-primary' : 'bg-brand-line dark:bg-night-line'
                  }`}
                />
                <div className={step.done ? '' : 'opacity-45'}>
                  <p className="text-[14px] font-bold text-brand-green dark:text-white">
                    {step.title}
                  </p>
                  {step.at && (
                    <p className="numeric mt-0.5 text-[12px] text-ink-soft dark:text-white/40">
                      {new Date(step.at).toLocaleString()}
                    </p>
                  )}
                  {step.detail && (
                    <p className="mt-0.5 text-[12px] text-ink-soft dark:text-white/40">
                      {step.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {request.volunteer_name && !request.otp_verified && (
            <div className="mt-4 pt-6 border-t border-brand-line dark:border-night-line">
              <div className="flex items-center gap-4">
                <span className="grid place-items-center size-11 shrink-0 rounded-full bg-brand-mint dark:bg-white/10 text-[14px] font-bold text-brand-moss dark:text-white">
                  {request.volunteer_name[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-brand-green dark:text-white">
                    {request.volunteer_name}
                  </p>
                  <p className="numeric text-[12px] text-ink-soft dark:text-white/40">
                    {request.volunteer_phone}
                  </p>
                </div>
              </div>

              {/* Only the NGO holds the code; the donor is the one who checks it. */}
              {!isDonor && request.otp && (
                <Panel
                  tone="sunken"
                  className="mt-5 p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-[12px] font-bold text-brand-green dark:text-white">
                      Pickup code
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-soft dark:text-white/35">
                      Share it with your volunteer only.
                    </p>
                  </div>
                  <OtpTiles value={String(request.otp)} />
                </Panel>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-brand-line dark:border-night-line flex items-center justify-between text-[12px]">
            <span className="text-ink-faint dark:text-white/35">Problem with this pickup?</span>
            <Link
              to="/grievances"
              className="font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">flag</span>
              Report issue
            </Link>
          </div>
        </Panel>
      )}
    </AppPage>
  );
}
