import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark';

const ROLES = [
  {
    id: 'DONOR',
    title: 'Donor',
    tagline: 'You have food left over.',
    details:
      'Restaurants, households, cloud kitchens and caterers. List surplus in about a minute and confirm the handover with a 4-digit code.',
    points: ['List in ~60 seconds', 'Choose who collects', 'Tax receipts generated'],
    canRegister: true,
  },
  {
    id: 'NGO',
    title: 'NGO / shelter',
    tagline: 'You can get it to people.',
    details:
      'Registered non-profits, orphanages and community shelters. Claim nearby listings and assign the volunteer who collects.',
    points: ['See nearby surplus live', 'Assign your volunteers', 'Admin-verified before claiming'],
    canRegister: true,
  },
  {
    id: 'ADMIN',
    title: 'Administrator',
    tagline: 'You keep it honest.',
    details:
      'AnnSparsh operations. Work the verification queue, audit organisations and watch platform-wide distribution.',
    points: ['Verification queue', 'Organisation audit', 'Platform metrics'],
    canRegister: false,
  },
];

export default function RoleSelection() {
  const [selected, setSelected] = useState('DONOR');
  const navigate = useNavigate();

  const current = ROLES.find((r) => r.id === selected);

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream dark:bg-night font-display">
      <header className="shrink-0 h-16 border-b border-brand-line dark:border-night-line">
        <div className="h-full max-w-[1240px] mx-auto px-5 sm:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center size-9 rounded-lg bg-brand-green dark:bg-primary text-white">
              <BrandMark className="size-[18px]" />
            </span>
            <span className="text-[17px] font-extrabold tracking-tightest text-brand-green dark:text-white">
              Ann<span className="text-primary">Sparsh</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/help"
              className="hidden sm:block text-[13.5px] font-semibold text-ink-soft dark:text-white/50 hover:text-primary transition-colors"
            >
              Help
            </Link>
            <Link
              to="/auth"
              className="text-[13.5px] font-bold text-brand-green dark:text-white hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <p className="eyebrow text-brand-emerald dark:text-primary">Choose your side of the handover</p>
        <h1 className="mt-6 max-w-2xl text-[38px] sm:text-[46px] leading-[1.08] text-brand-green dark:text-white">
          Which one are you?
        </h1>

        <div className="mt-12 grid gap-px bg-brand-line dark:bg-night-line border-y border-brand-line dark:border-night-line md:grid-cols-3">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                aria-pressed={isSelected}
                className={`text-left p-7 lg:p-8 transition-colors ${
                  isSelected
                    ? 'bg-white dark:bg-night-card'
                    : 'bg-brand-cream dark:bg-night hover:bg-white/60 dark:hover:bg-night-card/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`numeric text-[9.5px] font-bold uppercase tracking-[0.16em] ${
                      isSelected ? 'text-primary' : 'text-ink-faint dark:text-white/30'
                    }`}
                  >
                    {role.id}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full transition-colors ${
                      isSelected ? 'bg-primary' : 'bg-brand-line dark:bg-night-line'
                    }`}
                  />
                </div>

                <h2 className="mt-6 text-[22px] text-brand-green dark:text-white">{role.title}</h2>
                <p className="mt-1.5 text-[13.5px] font-semibold text-primary">{role.tagline}</p>
                <p className="mt-4 text-[13px] leading-relaxed text-ink-soft dark:text-white/45">
                  {role.details}
                </p>

                <ul className="mt-6 pt-5 border-t border-brand-line dark:border-night-line space-y-2">
                  {role.points.map((p) => (
                    <li
                      key={p}
                      className="text-[12.5px] text-ink-soft dark:text-white/40 flex gap-2.5"
                    >
                      <span aria-hidden="true" className="text-primary">
                        &mdash;
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4">
          <button
            onClick={() => navigate(`/auth?role=${selected}&mode=login`)}
            className="group inline-flex items-center gap-2.5 h-13 px-7 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-bold transition-colors"
          >
            Continue as {current.title.toLowerCase()}
            <span className="material-symbols-outlined text-[19px] transition-transform group-hover:translate-x-0.5">
              arrow_forward
            </span>
          </button>

          {current.canRegister && (
            <button
              onClick={() => navigate(`/auth?role=${selected}&mode=register`)}
              className="text-[15px] font-bold text-brand-green dark:text-white border-b border-brand-green/25 dark:border-white/25 hover:border-primary hover:text-primary dark:hover:text-primary pb-1 transition-colors"
            >
              Create a new account
            </button>
          )}
        </div>

        <p className="mt-10 text-[12px] text-ink-faint dark:text-white/30">
          By continuing you agree to the AnnSparsh terms of service and privacy policy.
        </p>
      </main>
    </div>
  );
}
