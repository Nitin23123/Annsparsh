import { useRef } from 'react';
import { RAILS, TONES, toneOf } from './tokens';

export function StatusPill({ status }) {
  return (
    <span
      className={`numeric shrink-0 text-[9.5px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded ${
        TONES[toneOf(status)]
      }`}
    >
      {status}
    </span>
  );
}

export function StatusRail({ status }) {
  return <span aria-hidden="true" className={`w-[3px] shrink-0 ${RAILS[toneOf(status)]}`} />;
}

/* ── Numbers ─────────────────────────────────────────────────────── */
export function StatBand({ items, loading }) {
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 border-t border-brand-line dark:border-night-line">
      {items.map((s, i) => (
        <div
          key={s.label}
          className={[
            'py-6 lg:py-7 pr-5 border-brand-line dark:border-night-line',
            i % 2 === 1 ? 'pl-5 border-l' : '',
            i < 2 ? 'border-b lg:border-b-0' : '',
            i > 0 ? 'lg:pl-7 lg:border-l' : '',
          ].join(' ')}
        >
          <dt className="numeric text-[32px] lg:text-[38px] leading-none font-bold text-brand-green dark:text-white">
            {loading ? '—' : s.value}
          </dt>
          <dd className="mt-2 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint dark:text-white/35">
            {s.label}
          </dd>
          {s.sub && (
            <dd className="mt-1 text-[11.5px] text-ink-soft dark:text-white/30">{s.sub}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/* ── Structure ───────────────────────────────────────────────────── */
export function SectionHead({ title, count, children }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <h2 className="flex items-baseline gap-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-green dark:text-white">
        {title}
        {count != null && (
          <span className="numeric text-[12px] font-medium text-ink-faint dark:text-white/30">
            {count}
          </span>
        )}
      </h2>
      {children}
    </div>
  );
}

export function Panel({ tone = 'raised', className = '', children }) {
  const grounds = {
    raised: 'bg-white dark:bg-night-card',
    sunken: 'bg-brand-cream dark:bg-night-soft',
  };

  return (
    <div
      className={`rounded-xl border border-brand-line dark:border-night-line ${grounds[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHead({ title, children }) {
  return (
    <div className="px-5 h-14 flex items-center justify-between gap-4 border-b border-brand-line dark:border-night-line">
      <h3 className="text-[13px] font-bold text-brand-green dark:text-white">{title}</h3>
      {children}
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, hint, children }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-line dark:border-night-line py-14 px-6 text-center">
      <span className="material-symbols-outlined text-[28px] text-ink-faint dark:text-white/25">
        {icon}
      </span>
      <p className="mt-2 text-[14px] font-bold text-brand-green dark:text-white">{title}</p>
      {hint && <p className="mt-1 text-[12.5px] text-ink-soft dark:text-white/35">{hint}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-night-card border border-brand-line dark:border-night-line animate-pulse ${className}`}
    />
  );
}

/* ── Buttons ─────────────────────────────────────────────────────── */
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const sizes = { md: 'h-10 px-4', sm: 'h-8 px-3', lg: 'h-12 px-6' };
  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    forest: 'bg-brand-green hover:bg-brand-moss dark:bg-white/10 dark:hover:bg-white/20 text-white',
    ghost:
      'border border-brand-line dark:border-night-line text-ink-soft dark:text-white/55 hover:text-brand-green dark:hover:text-white hover:border-brand-green dark:hover:border-white/40',
    danger:
      'border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-bold transition-colors disabled:opacity-55 disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ icon, className = '', ...props }) {
  return (
    <button
      className={`grid place-items-center size-9 rounded-lg border border-brand-line dark:border-night-line text-ink-soft dark:text-white/50 hover:text-brand-green dark:hover:text-white transition-colors ${className}`}
      {...props}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}

/* ── Forms ───────────────────────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-soft dark:text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}


/* ── The OTP motif ───────────────────────────────────────────────── */
export function OtpTiles({ value = '', tone = 'forest' }) {
  const skin =
    tone === 'forest'
      ? 'bg-brand-green dark:bg-primary text-white'
      : 'bg-primary-soft dark:bg-primary/15 text-primary';

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 4 }, (_, i) => (
        <span key={i} className={`otp-tile ${skin}`}>
          {value[i] ?? '·'}
        </span>
      ))}
    </div>
  );
}

export function OtpInput({ value = '', onChange, disabled }) {
  const refs = useRef([]);
  const chars = Array.from({ length: 4 }, (_, i) => value[i] ?? '');

  const commit = (next) => onChange(next.join('').replace(/\s/g, ''));

  const handleChange = (i, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...chars];
    next[i] = digit;
    commit(next);
    if (digit && i < 3) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      e.preventDefault();
      const next = [...chars];
      next[i - 1] = '';
      commit(next);
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 3) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!digits) return;
    e.preventDefault();
    onChange(digits);
    refs.current[Math.min(digits.length, 3)]?.focus();
  };

  return (
    <div className="flex gap-2">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={c}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${i + 1}`}
          className="otp-tile text-center bg-white dark:bg-night-soft border border-brand-line dark:border-night-line text-brand-green dark:text-white outline-none focus:border-primary transition-colors disabled:opacity-55"
        />
      ))}
    </div>
  );
}
