import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PROOF = [
  { value: '4-digit', label: 'OTP on every handover' },
  { value: '41 min', label: 'Median pickup time' },
  { value: '100%', label: 'Admin-vetted NGOs' },
];

export default function Hero() {
  const [meals, setMeals] = useState(14820);

  useEffect(() => {
    const timer = setInterval(
      () => setMeals((p) => p + Math.floor(Math.random() * 4) + 1),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-brand-cream dark:bg-night overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 w-[46rem] h-[46rem] rounded-full bg-primary/10 dark:bg-primary/[0.07] blur-[130px]"
      />

      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 pt-14 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-12 gap-14 lg:gap-16 items-center">
        <div className="lg:col-span-7">
          <p className="eyebrow text-brand-emerald dark:text-primary animate-fade-in-up">
            Surplus rescue network &middot; 18 cities
          </p>

          <h1 className="mt-7 text-brand-green dark:text-white animate-fade-in-up delay-100">
            Good food should
            <br />
            never reach
            <span className="relative inline-block ml-3 px-1">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 h-[38%] bg-primary/25 dark:bg-primary/30 -rotate-1"
              />
              <span className="relative text-primary">a bin.</span>
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-ink-soft dark:text-white/60 animate-fade-in-up delay-200">
            List extra food in about a minute. A verified NGO nearby claims it, sends a volunteer,
            and the handover only completes when you enter their 4-digit code.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 animate-fade-in-up delay-300">
            <Link
              to="/auth?role=DONOR&mode=register"
              className="group inline-flex items-center gap-2.5 h-[52px] px-7 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-bold shadow-lift transition-colors"
            >
              Donate surplus food
              <span className="material-symbols-outlined text-[19px] transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>

            <Link
              to="/auth?role=NGO&mode=register"
              className="group inline-flex items-center gap-2 text-[15px] font-bold text-brand-green dark:text-white border-b border-brand-green/25 dark:border-white/25 hover:border-primary hover:text-primary dark:hover:text-primary pb-1 transition-colors"
            >
              Register your NGO
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                north_east
              </span>
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-3 border-t border-brand-line dark:border-night-line animate-fade-in-up delay-400">
            {PROOF.map((p) => (
              <div key={p.value} className="pt-6 pr-4">
                <dt className="numeric text-2xl sm:text-[28px] font-bold text-brand-green dark:text-white">
                  {p.value}
                </dt>
                <dd className="mt-1.5 text-[12.5px] leading-snug text-ink-soft dark:text-white/45">
                  {p.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 animate-fade-in delay-200">
          <figure className="relative rounded-2xl overflow-hidden aspect-[4/4.6] bg-brand-cream-soft dark:bg-night-soft">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAyEFGPRA45ivjUjsP21WZ3IeGMXdAjumuWw1aN4pGLvkzZNNnnvjRbh8imjuKVRSjVUPPsMl2RaYbVnPeWdOXPMLzYrws6M031BR5s_NmIsZbyE6gViSSftO8e9LqTZ8vDMtv5az1wt6ypCwE4qQJGCSqw08aHgRwtz1F5qbe3M3wuT_0Ik6VwLhvvKJjV6Ozs7yS9OiR-ScoiI7cf93mxibETI9a-TOkx1Jw97KjpuMDmicDjqWe_YRt_MVyEOAmbIYf4bnDlcw"
              alt="A volunteer handing over rescued meals to a community kitchen"
              className="w-full h-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-brand-green/85 via-brand-green/10 to-transparent"
            />

            <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="numeric text-[10px] uppercase tracking-[0.2em] text-primary-tint">
                Meals rescued to date
              </p>
              <p className="numeric mt-1.5 text-4xl font-bold tabular-nums">
                {meals.toLocaleString()}
              </p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
