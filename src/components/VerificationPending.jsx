import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { Button, Panel } from './dashboard/ui';

export default function VerificationPending() {
  return (
    <div className="min-h-screen grid place-items-center px-5 py-16 bg-brand-cream dark:bg-night font-display">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
          <span className="grid place-items-center size-9 rounded-lg bg-brand-green dark:bg-primary text-white">
            <BrandMark className="size-[18px]" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tightest text-brand-green dark:text-white">
            Ann<span className="text-primary">Sparsh</span>
          </span>
        </Link>

        <p className="eyebrow text-primary">Under review</p>

        <h1 className="mt-5 text-[30px] leading-tight text-brand-green dark:text-white">
          We&rsquo;re checking your documents.
        </h1>

        <p className="mt-5 text-[14.5px] leading-relaxed text-ink-soft dark:text-white/45">
          Thanks for signing up. An admin reviews every NGO before food-claim privileges are
          unlocked. This usually takes 24&ndash;48 hours.
        </p>

        <Panel tone="sunken" className="mt-8 p-5">
          <h2 className="text-[13px] font-bold text-brand-green dark:text-white">
            Why we verify at all
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft dark:text-white/45">
            Donors hand real food to strangers. Vetting every organisation first is what makes the
            4-digit handover code worth trusting.
          </p>
        </Panel>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button variant="forest">Check status</Button>
          <Link
            to="/"
            className="text-[13.5px] font-bold text-ink-soft dark:text-white/50 hover:text-primary transition-colors"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-10 pt-6 border-t border-brand-line dark:border-night-line text-[12.5px] text-ink-faint dark:text-white/30">
          Need help?{' '}
          <Link to="/help" className="font-bold text-primary hover:text-primary-hover">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
