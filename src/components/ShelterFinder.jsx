import { useState } from 'react';
import AppPage from './dashboard/AppPage';
import { Button, EmptyState } from './dashboard/ui';
import { inputClass } from './dashboard/tokens';

const SHELTERS = [
  { id: 1, name: 'Hope Foundation', type: 'Orphanage', distance: '1.2 km', address: '42 Civil Lines' },
  {
    id: 2,
    name: 'City Animal Shelter',
    type: 'Animal shelter',
    distance: '3.5 km',
    address: 'Sector 15, Noida',
  },
  {
    id: 3,
    name: 'Grace Community Kitchen',
    type: 'Homeless shelter',
    distance: '5.0 km',
    address: 'Old Delhi Road',
  },
];

export default function ShelterFinder() {
  const [query, setQuery] = useState('');

  const visible = SHELTERS.filter((s) =>
    `${s.name} ${s.type} ${s.address}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <AppPage
      back="/donor-dashboard"
      backLabel="Back to dashboard"
      title="Nearby shelters"
      subtitle="Sample directory — not yet backed by live data."
      width="max-w-3xl"
    >
      <label className="block">
        <span className="sr-only">Search shelters</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, type or area"
          className={inputClass}
        />
      </label>

      <p className="numeric mt-6 mb-4 text-[9.5px] uppercase tracking-[0.16em] text-ink-faint dark:text-white/30">
        {visible.length} nearby
      </p>

      {visible.length === 0 ? (
        <EmptyState icon="search_off" title="No matches" hint="Try a different area or name." />
      ) : (
        <ul className="divide-y divide-brand-line dark:divide-night-line border-y border-brand-line dark:border-night-line">
          {visible.map((s) => (
            <li key={s.id} className="py-5 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-brand-green dark:text-white">{s.name}</h2>
                <p className="mt-0.5 text-[12.5px] text-ink-soft dark:text-white/45">
                  {s.type} · {s.address}
                </p>
                <p className="numeric mt-1 text-[11.5px] font-bold text-primary">{s.distance} away</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm">
                  Call
                </Button>
                <Button variant="forest" size="sm">
                  Directions
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-[12px] leading-relaxed text-ink-faint dark:text-white/30">
        These entries are placeholder data. Shelters are not stored in the database yet, so this
        list is the same for everyone and the distances are illustrative.
      </p>
    </AppPage>
  );
}
