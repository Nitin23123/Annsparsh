import { Link } from 'react-router-dom';
import BrandMark from '../BrandMark';

/* Shell for the standalone authed pages that hang off the dashboards.
   Deliberately mirrors DashboardLayout's top bar so navigating between
   them doesn't feel like crossing into a different product. */
export default function AppPage({
  back,
  backLabel = 'Back',
  title,
  subtitle,
  actions,
  width = 'max-w-3xl',
  children,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream dark:bg-night font-display">
      <header className="sticky top-0 z-40 shrink-0 h-16 bg-white dark:bg-night-card border-b border-brand-line dark:border-night-line">
        <div className="h-full max-w-[1240px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {back ? (
              <Link
                to={back}
                aria-label={backLabel}
                className="grid place-items-center size-9 shrink-0 rounded-lg border border-brand-line dark:border-night-line text-brand-green dark:text-white hover:border-brand-green dark:hover:border-white/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              </Link>
            ) : (
              <Link
                to="/"
                aria-label="AnnSparsh home"
                className="grid place-items-center size-9 shrink-0 rounded-lg bg-brand-green dark:bg-primary text-white"
              >
                <BrandMark className="size-[18px]" />
              </Link>
            )}

            <div className="min-w-0">
              <h1 className="text-[15px] font-bold text-brand-green dark:text-white truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[12px] text-ink-soft dark:text-white/40 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        </div>
      </header>

      <main className={`flex-1 w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 ${width}`}>{children}</main>
    </div>
  );
}
