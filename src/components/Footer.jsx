import { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

const COLUMNS = [
  {
    heading: 'Portals',
    links: [
      { to: '/auth?role=DONOR&mode=login', label: 'Donor portal' },
      { to: '/auth?role=NGO&mode=login', label: 'NGO dashboard' },
      { to: '/auth?role=ADMIN&mode=login', label: 'Admin console' },
      { to: '/role-selection', label: 'Choose a role' },
      { to: '/verification-pending', label: 'Application status' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { to: '/shelters', label: 'Shelter finder' },
      { to: '/tracking', label: 'Live tracking' },
      { to: '/grievances', label: 'Report Grievance' },
      { to: '/verification-pending', label: 'Identity Verification' },
      { to: '/help', label: 'Help centre' },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-brand-green dark:bg-night text-white">
      {/* Closing call to action */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-24 lg:py-28 border-b border-white/10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-primary">Start tonight</p>
            <h2 className="mt-6 text-white">
              You have food left over.
              <br />
              Someone nearby is waiting.
            </h2>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              to="/auth?role=DONOR&mode=register"
              className="group inline-flex items-center justify-between gap-3 h-14 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-bold transition-colors"
            >
              Donate surplus food
              <span className="material-symbols-outlined text-[19px] transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
            <Link
              to="/auth?role=NGO&mode=register"
              className="group inline-flex items-center justify-between gap-3 h-14 px-6 rounded-xl border border-white/20 hover:border-white/50 text-white text-[15px] font-bold transition-colors"
            >
              Register your NGO
              <span className="material-symbols-outlined text-[19px] transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Directory */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid place-items-center size-9 rounded-xl bg-primary text-white">
              <BrandMark className="size-5" />
            </span>
            <span className="text-[19px] font-extrabold tracking-tightest text-white">
              Ann<span className="text-primary">Sparsh</span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/45">
            &ldquo;A touch of food&rdquo; &mdash; connecting surplus meals with verified non-profits
            across India, one OTP-verified handover at a time.
          </p>

          <div className="mt-6 flex gap-2">
            {['public', 'share', 'mail'].map((icon) => (
              <a
                key={icon}
                href="#"
                className="grid place-items-center size-9 rounded-lg border border-white/15 text-white/55 hover:text-primary hover:border-primary/50 transition-colors"
                aria-label={icon}
              >
                <span className="material-symbols-outlined text-[17px]">{icon}</span>
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.heading} className="lg:col-span-2">
            <h3 className="numeric text-[10px] uppercase tracking-[0.18em] text-white/35 font-medium">
              {col.heading}
            </h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-white/65 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="lg:col-span-4">
          <h3 className="numeric text-[10px] uppercase tracking-[0.18em] text-white/35 font-medium">
            Monthly impact report
          </h3>
          <p className="mt-5 text-[13.5px] leading-relaxed text-white/45">
            What was rescued, by whom, and where it went. No marketing.
          </p>

          <form onSubmit={handleSubscribe} className="mt-5">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-label="Email address"
                className="flex-1 min-w-0 h-11 px-4 rounded-lg bg-white/5 border border-white/15 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="grid place-items-center size-11 shrink-0 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
                aria-label="Subscribe"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
            <p
              className={`mt-2 text-[12px] text-brand-emerald transition-opacity ${
                subscribed ? 'opacity-100' : 'opacity-0'
              }`}
              role="status"
            >
              Subscribed — see you next month.
            </p>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12.5px] text-white/35">
            © {new Date().getFullYear()} AnnSparsh Foundation
          </p>
          <div className="flex gap-7">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[12.5px] text-white/35 hover:text-primary transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
