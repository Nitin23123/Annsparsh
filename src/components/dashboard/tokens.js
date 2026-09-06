/* Status vocabulary for the dashboards.

   Every status in the app collapses onto the landing palette: emerald for
   settled-good, persimmon for in-flight, forest for handed over, muted for
   done, red only for genuine failure. */

export const TONES = {
  emerald: 'bg-brand-mint text-brand-moss dark:bg-brand-emerald/15 dark:text-brand-emerald',
  primary: 'bg-primary-soft text-primary dark:bg-primary/15 dark:text-primary',
  forest: 'bg-brand-green/10 text-brand-green dark:bg-white/10 dark:text-white/75',
  muted: 'bg-brand-cream-soft text-ink-faint dark:bg-white/5 dark:text-white/35',
  danger: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export const RAILS = {
  emerald: 'bg-brand-emerald',
  primary: 'bg-primary',
  forest: 'bg-brand-green dark:bg-white/60',
  muted: 'bg-brand-line dark:bg-white/15',
  danger: 'bg-red-500',
};

const STATUS_TONE = {
  AVAILABLE: 'emerald',
  APPROVED: 'emerald',
  VERIFIED: 'emerald',
  CLAIMED: 'primary',
  PENDING: 'primary',
  PENDING_REVIEW: 'primary',
  OTP_VERIFIED: 'forest',
  COLLECTED: 'forest',
  COMPLETED: 'muted',
  UNVERIFIED: 'muted',
  EXPIRED: 'danger',
  REJECTED: 'danger',
  RESOLVED: 'emerald',
  INVESTIGATING: 'primary',
  DISMISSED: 'muted',
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'primary',
  LOW: 'forest',
};

export const toneOf = (status) => STATUS_TONE[status] || 'muted';

const fieldBase =
  'w-full px-3.5 rounded-lg bg-white dark:bg-night-soft border border-brand-line dark:border-night-line text-[13.5px] text-ink dark:text-white placeholder:text-ink-faint dark:placeholder:text-white/25 outline-none focus:border-primary transition-colors';

export const inputClass = `${fieldBase} h-11`;
export const textareaClass = `${fieldBase} py-3 resize-none`;
