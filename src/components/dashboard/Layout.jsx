import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandMark from '../BrandMark';

function NavItem({ item, onNavigate }) {
  const base =
    'w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[13.5px] font-semibold text-left transition-colors';
  const tone = item.active
    ? 'bg-white/10 text-white'
    : 'text-white/50 hover:text-white hover:bg-white/5';

  const inner = (
    <>
      <span
        className={`material-symbols-outlined text-[19px] ${
          item.active ? 'text-primary' : 'text-white/35'
        }`}
      >
        {item.icon}
      </span>
      <span className="truncate">{item.label}</span>
      {item.badge > 0 && (
        <span className="numeric ml-auto shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
          {item.badge}
        </span>
      )}
    </>
  );

  if (item.to) {
    return (
      <Link to={item.to} onClick={onNavigate} className={`${base} ${tone}`}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
      className={`${base} ${tone}`}
    >
      {inner}
    </button>
  );
}

function SidebarBody({ label, nav, user, avatarFallback, onLogout, onNavigate }) {
  return (
    <>
      <Link to="/" className="flex items-center gap-2.5 px-5 h-16 shrink-0">
        <span className="grid place-items-center size-8 rounded-lg bg-primary text-white">
          <BrandMark className="size-[18px]" />
        </span>
        <span className="text-[15px] font-extrabold tracking-tightest text-white">
          Ann<span className="text-primary">Sparsh</span>
        </span>
      </Link>

      <p className="numeric px-5 pb-5 text-[9.5px] uppercase tracking-[0.18em] text-white/30">
        {label}
      </p>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => (
          <NavItem key={item.key ?? item.label} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
          <span className="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-white text-[12px] font-bold">
            {(user?.name || avatarFallback)[0].toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-white truncate">
              {user?.name || avatarFallback}
            </span>
            <span className="block text-[11px] text-white/35 truncate">{user?.email}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[13.5px] font-semibold text-white/45 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[19px] text-white/35">logout</span>
          Log out
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout({
  label,
  nav = [],
  user,
  avatarFallback = 'User',
  title,
  subtitle,
  actions,
  children,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const sidebarProps = { label, nav, user, avatarFallback, onLogout: logout };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-cream dark:bg-night font-display">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-brand-green dark:bg-night-soft">
        <SidebarBody {...sidebarProps} />
      </aside>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-brand-green/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-64 flex flex-col bg-brand-green dark:bg-night-soft animate-fade-in">
            <SidebarBody {...sidebarProps} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 h-16 px-4 sm:px-8 flex items-center justify-between gap-4 bg-white dark:bg-night-card border-b border-brand-line dark:border-night-line">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden grid place-items-center size-9 shrink-0 rounded-lg border border-brand-line dark:border-night-line text-brand-green dark:text-white"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
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
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-10">{children}</main>
      </div>
    </div>
  );
}
