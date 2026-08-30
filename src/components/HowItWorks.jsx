import { Link } from 'react-router-dom';

const STEPS = [
  {
    n: '01',
    role: 'Donor',
    title: 'List what is left over',
    body: 'Cuisine, rough portion count, pickup address and a best-before timer. Takes about a minute.',
  },
  {
    n: '02',
    role: 'Platform',
    title: 'Nearby NGOs are alerted',
    body: 'Vetted non-profits within range see the listing instantly, claim it, and assign a volunteer.',
  },
  {
    n: '03',
    role: 'Trust gate',
    title: 'The 4-digit code is checked',
    body: 'The volunteer arrives with a one-time code. Nothing leaves your door until it matches.',
    otp: true,
  },
  {
    n: '04',
    role: 'Impact',
    title: 'Food reaches a plate',
    body: 'Distribution is logged against the donation, generating your tax and CO₂ records.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-brand-green dark:bg-night-soft text-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-primary">The trust cycle</p>
            <h2 className="mt-6 text-white max-w-xl">
              Four steps, and one of them
              <span className="text-primary"> cannot be faked.</span>
            </h2>
          </div>
          <p className="lg:col-span-5 text-[15px] leading-relaxed text-white/55">
            Most food-donation apps stop at matching. AnnSparsh treats the handover itself as the
            product &mdash; a code generated at assignment, verified at the door, recorded against
            the donation.
          </p>
        </div>

        <ol className="mt-16 lg:mt-20 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="group relative bg-brand-green dark:bg-night-soft p-8 lg:p-9 transition-colors duration-300 hover:bg-brand-moss dark:hover:bg-night-card"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="numeric text-[13px] font-bold text-primary">{s.n}</span>
                <span className="numeric text-[9.5px] uppercase tracking-[0.18em] text-white/35">
                  {s.role}
                </span>
              </div>

              <span
                aria-hidden="true"
                className="mt-6 block h-px w-full bg-white/15 relative overflow-hidden"
              >
                <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-[width] duration-500 group-hover:w-full" />
              </span>

              <h3 className="mt-6 text-white text-[19px] leading-snug font-bold">{s.title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/50">{s.body}</p>

              {s.otp && (
                <div className="mt-6 flex gap-1.5" aria-label="Example one-time code">
                  {['7', '3', '0', '4'].map((digit, i) => (
                    <span
                      key={i}
                      className="otp-tile bg-white/10 border border-white/15 text-primary"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-10 border-t border-white/10">
          <p className="text-[15px] font-semibold text-white/70 max-w-md">
            Running an event tonight? Volunteers in 18 cities are on standby for untouched meals.
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              to="/auth?role=DONOR&mode=register"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-[14px] font-bold transition-colors"
            >
              Schedule a pickup
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to="/shelters"
              className="text-[14px] font-bold text-white/70 hover:text-primary border-b border-white/25 hover:border-primary pb-1 transition-colors"
            >
              Find nearby shelters
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
