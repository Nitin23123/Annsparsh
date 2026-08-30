import { useEffect, useRef, useState } from 'react';

const TARGETS = { meals: 52400, partners: 142, cities: 18, carbon: 131 };

const PRESETS = [
  { label: 'Household', value: 10 },
  { label: 'Cafe', value: 35 },
  { label: 'Restaurant', value: 75 },
  { label: 'Banquet', value: 200 },
];

export default function StatsSection() {
  const [stats, setStats] = useState({ meals: 0, partners: 0, cities: 0, carbon: 0 });
  const [weekly, setWeekly] = useState(35);
  const sectionRef = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;

        const steps = 45;
        const duration = 1500;
        let step = 0;
        const timer = setInterval(() => {
          step += 1;
          const t = step / steps;
          const eased = 1 - Math.pow(1 - t, 3);
          setStats({
            meals: Math.floor(TARGETS.meals * eased),
            partners: Math.floor(TARGETS.partners * eased),
            cities: Math.floor(TARGETS.cities * eased),
            carbon: Math.floor(TARGETS.carbon * eased),
          });
          if (step >= steps) {
            clearInterval(timer);
            setStats(TARGETS);
          }
        }, duration / steps);
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const monthlyMeals = weekly * 4;
  const results = [
    { value: Math.round(monthlyMeals * 1.2).toLocaleString(), unit: 'people', label: 'fed each month' },
    { value: Math.round(monthlyMeals * 2.5).toLocaleString(), unit: 'kg', label: 'CO₂ kept out of landfill' },
    { value: Math.round(monthlyMeals * 140).toLocaleString(), unit: 'litres', label: 'virtual water saved' },
  ];

  const figures = [
    { value: `${(stats.meals / 1000).toFixed(1)}k`, label: 'Meals rescued' },
    { value: stats.partners, label: 'Verified NGOs' },
    { value: stats.cities, label: 'Cities covered' },
    { value: `${stats.carbon}t`, label: 'CO₂ offset' },
  ];

  return (
    <section id="impact" ref={sectionRef} className="bg-brand-cream dark:bg-night">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-24 lg:py-32">
        <p className="eyebrow text-brand-emerald dark:text-primary">Verified impact</p>

        <div className="mt-6 grid lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          <h2 className="lg:col-span-6 text-brand-green dark:text-white">
            Every number here is
            <br className="hidden sm:block" /> tied to a signed handover.
          </h2>
          <p className="lg:col-span-5 lg:col-start-8 text-[15px] leading-relaxed text-ink-soft dark:text-white/50">
            Nothing is counted until a donor confirms the volunteer&rsquo;s code, so these totals
            reflect food that actually changed hands &mdash; not listings that were merely created.
          </p>
        </div>

        {/* Numeric band — hairline dividers instead of four identical cards */}
        <dl className="mt-16 grid grid-cols-2 lg:grid-cols-4 border-t border-brand-line dark:border-night-line">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className={[
                'py-9 lg:py-12 pr-6 border-brand-line dark:border-night-line',
                i % 2 === 1 ? 'pl-6 border-l' : '',
                i < 2 ? 'border-b lg:border-b-0' : '',
                i > 0 ? 'lg:pl-8 lg:border-l' : '',
              ].join(' ')}
            >
              <dt className="numeric text-[42px] lg:text-[56px] leading-none font-bold text-brand-green dark:text-white">
                {f.value}
              </dt>
              <dd className="mt-3 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint dark:text-white/40">
                {f.label}
              </dd>
            </div>
          ))}
        </dl>

        {/* Impact calculator */}
        <div className="mt-20 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center rounded-2xl border border-brand-line dark:border-night-line bg-white dark:bg-night-card p-8 sm:p-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-primary">Estimate your own</p>
            <h3 className="mt-5 text-brand-green dark:text-white">
              What does your surplus add up to?
            </h3>

            <div className="mt-8 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setWeekly(p.value)}
                  className={`h-9 px-4 rounded-lg text-[12.5px] font-bold transition-colors ${
                    weekly === p.value
                      ? 'bg-brand-green dark:bg-primary text-white'
                      : 'border border-brand-line dark:border-night-line text-ink-soft dark:text-white/55 hover:border-brand-green dark:hover:border-white/40 hover:text-brand-green dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-9">
              <label
                htmlFor="weekly-meals"
                className="flex items-baseline justify-between gap-4"
              >
                <span className="text-[13px] font-semibold text-ink-soft dark:text-white/55">
                  Surplus meals per week
                </span>
                <span className="numeric text-2xl font-bold text-primary">{weekly}</span>
              </label>
              <input
                id="weekly-meals"
                type="range"
                min="5"
                max="500"
                step="5"
                value={weekly}
                onChange={(e) => setWeekly(Number(e.target.value))}
                className="range-warm mt-4"
              />
              <div className="numeric mt-3 flex justify-between text-[10.5px] text-ink-faint dark:text-white/30">
                <span>5</span>
                <span>250</span>
                <span>500</span>
              </div>
            </div>
          </div>

          <dl className="lg:col-span-5 lg:col-start-8 divide-y divide-brand-line dark:divide-night-line">
            {results.map((r) => (
              <div key={r.label} className="py-5 first:pt-0 last:pb-0">
                <dt className="numeric text-[32px] leading-none font-bold text-brand-green dark:text-white">
                  {r.value}
                  <span className="ml-1.5 text-[15px] font-medium text-primary">{r.unit}</span>
                </dt>
                <dd className="mt-2 text-[12.5px] text-ink-soft dark:text-white/45">{r.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
