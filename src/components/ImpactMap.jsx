import { useState } from 'react';
import { Link } from 'react-router-dom';

const DONATIONS = [
  {
    id: 1,
    title: '50 veg biryani & curry boxes',
    donor: 'Grand Meridian Banquet',
    category: 'COOKED',
    type: 'Cooked meals',
    location: 'Andheri West, Mumbai',
    window: '3h 15m',
    urgency: 0.42,
    status: 'AVAILABLE',
  },
  {
    id: 2,
    title: '40 croissants & wheat loaves',
    donor: 'Artisan Bakery Hub',
    category: 'BAKERY',
    type: 'Bakery',
    location: 'Koramangala, Bengaluru',
    window: '5h 40m',
    urgency: 0.2,
    status: 'CLAIMED',
    claimedBy: 'Robin Hood Army',
  },
  {
    id: 3,
    title: '80kg farm vegetables & fruit',
    donor: 'Greenfield Supermarket',
    category: 'PRODUCE',
    type: 'Produce',
    location: 'Sector 62, Noida',
    window: '12h 00m',
    urgency: 0.08,
    status: 'AVAILABLE',
  },
  {
    id: 4,
    title: '30 North Indian thalis',
    donor: 'Swaad Corporate Cafeteria',
    category: 'COOKED',
    type: 'Cooked meals',
    location: 'Hinjewadi, Pune',
    window: '1h 45m',
    urgency: 0.78,
    status: 'IN_TRANSIT',
    claimedBy: 'Seva Shelter Corps',
    otp: '7712',
  },
];

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'COOKED', label: 'Cooked meals' },
  { id: 'BAKERY', label: 'Bakery' },
  { id: 'PRODUCE', label: 'Produce' },
];

const STATUS = {
  AVAILABLE: { label: 'Available', rail: 'bg-brand-emerald', text: 'text-brand-emerald' },
  CLAIMED: { label: 'Claimed', rail: 'bg-primary', text: 'text-primary' },
  IN_TRANSIT: { label: 'In transit', rail: 'bg-brand-green dark:bg-white/70', text: 'text-brand-green dark:text-white/70' },
};

const PILLARS = [
  {
    title: 'Only vetted non-profits',
    body: '80G/12A certified organisations with named ground volunteers are the only accounts that can claim a listing.',
  },
  {
    title: 'The code is the contract',
    body: 'A 4-digit code is generated when a volunteer is assigned and verified by the donor at the door. No match, no pickup.',
  },
  {
    title: 'Paperwork, generated',
    body: 'Completed handovers produce donation receipts and ESG audit logs for corporate and restaurant donors.',
  },
];

export default function ImpactMap() {
  const [filter, setFilter] = useState('ALL');
  const visible = filter === 'ALL' ? DONATIONS : DONATIONS.filter((d) => d.category === filter);

  return (
    <section id="feed" className="bg-brand-cream-soft dark:bg-night-soft">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl">
            <p className="eyebrow text-brand-emerald dark:text-primary">Open right now</p>
            <h2 className="mt-6 text-brand-green dark:text-white">Food waiting on a pickup.</h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-soft dark:text-white/50">
              A sample of what verified NGOs see when they sign in. Listings expire on their
              freshness window, so the feed clears itself.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter listings by category"
            className="flex flex-wrap gap-1 p-1 rounded-xl border border-brand-line dark:border-night-line bg-white dark:bg-night-card self-start"
          >
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`h-9 px-4 rounded-lg text-[12.5px] font-bold transition-colors ${
                  filter === f.id
                    ? 'bg-brand-green dark:bg-primary text-white'
                    : 'text-ink-soft dark:text-white/50 hover:text-brand-green dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((d) => {
            const s = STATUS[d.status];
            return (
              <article
                key={d.id}
                className="group relative flex flex-col rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line overflow-hidden transition-shadow duration-300 hover:shadow-lift"
              >
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${s.rail}`} />

                <div className="p-6 pl-7 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="numeric text-[9.5px] uppercase tracking-[0.16em] text-ink-faint dark:text-white/35">
                      {d.type}
                    </span>
                    <span className={`numeric text-[9.5px] uppercase tracking-[0.16em] font-bold ${s.text}`}>
                      {s.label}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[16.5px] leading-snug font-bold text-brand-green dark:text-white">
                    {d.title}
                  </h3>

                  <p className="mt-3 text-[13px] font-semibold text-ink dark:text-white/70">
                    {d.donor}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-ink-soft dark:text-white/40">
                    {d.location}
                  </p>
                </div>

                <div className="px-6 pl-7 pb-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[11.5px] font-semibold text-ink-faint dark:text-white/35">
                      Freshness window
                    </span>
                    <span className="numeric text-[13px] font-bold text-brand-green dark:text-white">
                      {d.window}
                    </span>
                  </div>

                  <div
                    className="mt-2 h-1 rounded-full bg-brand-cream-soft dark:bg-white/10 overflow-hidden"
                    role="img"
                    aria-label={`${d.window} of freshness window remaining`}
                  >
                    <span
                      className={`block h-full rounded-full ${
                        d.urgency > 0.6 ? 'bg-primary' : 'bg-brand-emerald'
                      }`}
                      style={{ width: `${Math.round((1 - d.urgency) * 100)}%` }}
                    />
                  </div>

                  <div className="mt-5">
                    {d.status === 'AVAILABLE' ? (
                      <Link
                        to="/auth?role=NGO&mode=login"
                        className="flex items-center justify-center h-10 rounded-lg bg-brand-green dark:bg-white/10 text-white text-[12.5px] font-bold hover:bg-brand-moss dark:hover:bg-white/20 transition-colors"
                      >
                        Claim as verified NGO
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between gap-2 h-10 px-3 rounded-lg border border-brand-line dark:border-night-line">
                        <span className="text-[11.5px] font-semibold text-ink-soft dark:text-white/45 truncate">
                          {d.claimedBy}
                        </span>
                        {d.otp && (
                          <span className="numeric shrink-0 text-[11px] font-bold text-primary tracking-[0.12em]">
                            {d.otp}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <dl className="mt-20 grid md:grid-cols-3 gap-px bg-brand-line dark:bg-night-line border-y border-brand-line dark:border-night-line">
          {PILLARS.map((p) => (
            <div key={p.title} className="bg-brand-cream-soft dark:bg-night-soft py-10 md:pr-8">
              <dt className="text-[16px] font-bold text-brand-green dark:text-white">{p.title}</dt>
              <dd className="mt-3 text-[13.5px] leading-relaxed text-ink-soft dark:text-white/45">
                {p.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
