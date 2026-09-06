import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

const NAV = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#impact', label: 'Impact' },
  { href: '#feed', label: 'Live feed' },
];

export default function Header() {
  const [isDark, setIsDark] = useState(
    () =>
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark'
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-brand-cream/85 dark:bg-night/85 backdrop-blur-xl border-b border-brand-line dark:border-night-line'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div
        className={`max-w-[1240px] mx-auto px-5 sm:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-16' : 'h-20'
        }`}
      >
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <span className="grid place-items-center size-9 rounded-xl bg-brand-green dark:bg-primary text-brand-cream transition-transform duration-300 group-hover:-rotate-6">
            <BrandMark className="size-5" />
          </span>
          <span className="leading-none">
            <span className="block text-[19px] font-extrabold tracking-tightest text-brand-green dark:text-white">
              Ann<span className="text-primary">Sparsh</span>
            </span>
            <span className="hidden sm:block mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint dark:text-white/40">
              A touch of food
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 text-[13.5px] font-semibold text-ink-soft dark:text-white/60 hover:text-brand-green dark:hover:text-white transition-colors after:absolute after:left-0 after:-bottom-px after:h-px after:w-0 after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/shelters"
            className="relative py-1 text-[13.5px] font-semibold text-ink-soft dark:text-white/60 hover:text-brand-green dark:hover:text-white transition-colors after:absolute after:left-0 after:-bottom-px after:h-px after:w-0 after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
          >
            Shelters
          </Link>
          <Link
            to="/grievances"
            className="relative py-1 text-[13.5px] font-semibold text-ink-soft dark:text-white/60 hover:text-brand-green dark:hover:text-white transition-colors after:absolute after:left-0 after:-bottom-px after:h-px after:w-0 after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
          >
            Report Issue
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="grid place-items-center size-9 rounded-lg text-ink-soft dark:text-white/55 hover:text-brand-green dark:hover:text-white hover:bg-brand-green/5 dark:hover:bg-white/5 transition-colors"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <span className="material-symbols-outlined text-[19px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            to="/auth"
            className="hidden sm:block px-3 py-2 text-[13.5px] font-semibold text-brand-green dark:text-white/80 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Sign in
          </Link>

          <Link
            to="/role-selection"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-brand-green dark:bg-primary text-white text-[13.5px] font-bold hover:bg-brand-moss dark:hover:bg-primary-hover transition-colors"
          >
            Get started
            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden grid place-items-center size-9 rounded-lg text-brand-green dark:text-white hover:bg-brand-green/5 dark:hover:bg-white/5"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-[22px]">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-brand-cream dark:bg-night px-5 pt-6 pb-10 overflow-y-auto animate-fade-in">
          <nav className="flex flex-col divide-y divide-brand-line dark:divide-night-line">
            {[...NAV, { href: '/shelters', label: 'Shelters', to: true }, { href: '/grievances', label: 'Report Issue', to: true }, { href: '/help', label: 'Help centre', to: true }].map(
              (item) =>
                item.to ? (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-4 text-xl font-bold text-brand-green dark:text-white"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="py-4 text-xl font-bold text-brand-green dark:text-white"
                  >
                    {item.label}
                  </a>
                )
            )}
          </nav>

          <div className="mt-8 grid gap-3">
            <Link
              to="/auth?role=DONOR&mode=register"
              onClick={() => setMenuOpen(false)}
              className="h-12 grid place-items-center rounded-lg bg-primary text-white text-sm font-bold"
            >
              Donate surplus food
            </Link>
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className="h-12 grid place-items-center rounded-lg border border-brand-line dark:border-night-line text-brand-green dark:text-white text-sm font-bold"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
