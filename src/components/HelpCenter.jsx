import { useState } from 'react';
import AppPage from './dashboard/AppPage';
import { Button, Field, Panel } from './dashboard/ui';
import { inputClass, textareaClass } from './dashboard/tokens';

const TABS = [
  { id: 'faq', label: 'FAQs' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'contact', label: 'Contact' },
];

const FAQS = [
  {
    q: 'How do I list a food donation?',
    a: 'Open your dashboard and choose “New donation”. Describe the food, the rough quantity, and when it needs collecting.',
  },
  {
    q: 'Is my pickup address shared publicly?',
    a: 'No. Your exact address is only revealed to the verified NGO once they claim your listing.',
  },
  {
    q: 'Can I donate cooked food?',
    a: 'Yes — cooked food, raw ingredients and packaged items are all accepted, provided cooked food is fresh and has been handled hygienically.',
  },
  {
    q: 'What is the 4-digit code for?',
    a: 'It is generated when an NGO assigns a volunteer. The pickup only completes when you enter the volunteer’s code, so food cannot be collected by anyone else.',
  },
];

export default function HelpCenter() {
  const [tab, setTab] = useState('faq');

  return (
    <AppPage
      title="Help centre"
      subtitle="Answers, policy, and a way to reach us."
      width="max-w-3xl"
      actions={
        <div className="hidden sm:flex gap-1 p-1 rounded-lg border border-brand-line dark:border-night-line">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`h-8 px-3.5 rounded text-[12.5px] font-bold transition-colors ${
                tab === t.id
                  ? 'bg-brand-green dark:bg-primary text-white'
                  : 'text-ink-soft dark:text-white/50 hover:text-brand-green dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="sm:hidden mb-6 flex gap-1 p-1 rounded-lg border border-brand-line dark:border-night-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-9 rounded text-[12.5px] font-bold transition-colors ${
              tab === t.id
                ? 'bg-brand-green dark:bg-primary text-white'
                : 'text-ink-soft dark:text-white/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'faq' && (
        <dl className="divide-y divide-brand-line dark:divide-night-line border-y border-brand-line dark:border-night-line">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6">
              <dt className="text-[16px] font-bold text-brand-green dark:text-white">{item.q}</dt>
              <dd className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft dark:text-white/45">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {tab === 'privacy' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-[16px] font-bold text-brand-green dark:text-white">
              What we collect
            </h2>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft dark:text-white/45">
              Only what a handover needs: your name, contact details, and the pickup location for
              each listing you create.
            </p>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-brand-green dark:text-white">How it is used</h2>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft dark:text-white/45">
              To connect you with verified NGOs and to record completed pickups for your tax and
              audit paperwork. We do not sell your data to third parties.
            </p>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-brand-green dark:text-white">Who sees it</h2>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft dark:text-white/45">
              Your address is shared with a single NGO — the one that claims your listing — and not
              before.
            </p>
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <Panel className="p-6 sm:p-8">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <Field label="Subject">
              <input type="text" placeholder="How can we help?" className={inputClass} />
            </Field>
            <Field label="Message">
              <textarea rows="5" placeholder="Describe your issue…" className={textareaClass} />
            </Field>
            <Button type="submit" variant="forest">
              Send message
            </Button>
          </form>
        </Panel>
      )}
    </AppPage>
  );
}
