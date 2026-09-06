import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import Header from './Header';
import Footer from './Footer';
import { Button, Panel, StatusPill, EmptyState } from './dashboard/ui';
import { inputClass, textareaClass } from './dashboard/tokens';

const CATEGORIES = [
  { id: 'FOOD_QUALITY', label: 'Food Quality / Safety', icon: 'restaurant', desc: 'Expired, spoiled, sour, or unsafe food handed over' },
  { id: 'NO_SHOW', label: 'Pickup No-Show', icon: 'schedule', desc: 'Assigned volunteer or NGO never showed up at scheduled time' },
  { id: 'MISCONDUCT', label: 'Misconduct & Behavior', icon: 'gavel', desc: 'Rude behavior, harassment, uncooperative attitude' },
  { id: 'FRAUD', label: 'Fraud & Misrepresentation', icon: 'security', desc: 'Fake quantities, OTP bypass attempt, false listing' },
  { id: 'OTHER', label: 'Other Issue', icon: 'help_center', desc: 'Operational dispute or technical grievance' },
];

const ROLES = [
  { id: 'VOLUNTEER', label: 'Volunteer', hint: 'Pickup driver or field collector' },
  { id: 'DONOR', label: 'Food Donor', hint: 'Restaurant, caterer, or individual' },
  { id: 'NGO', label: 'NGO / Recipient', hint: 'Claiming organisation' },
  { id: 'OTHER', label: 'Other / Unknown', hint: 'Platform entity or general dispute' },
];

const SEVERITIES = [
  { id: 'LOW', label: 'Low', desc: 'Minor delay or inconvenience' },
  { id: 'MEDIUM', label: 'Medium', desc: 'Standard policy or operational issue' },
  { id: 'HIGH', label: 'High', desc: 'Food safety hazard or repeated misconduct' },
  { id: 'CRITICAL', label: 'Critical', desc: 'Urgent harassment, theft, or legal violation' },
];

export default function Grievances() {
  const [activeTab, setActiveTab] = useState('new');
  const [user, setUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const [formData, setFormData] = useState({
    reported_role: 'VOLUNTEER',
    reported_name: '',
    category: 'FOOD_QUALITY',
    severity: 'MEDIUM',
    donation_id: '',
    description: '',
  });

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchMyReports = async () => {
    if (!localStorage.getItem('token')) return;
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/reports/mine');
      setMyReports(data);
    } catch {
      toast.error('Could not load filed grievances');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyReports();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error('Please describe the incident');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reported_role: formData.reported_role,
        reported_name: formData.reported_name.trim() || undefined,
        category: formData.category,
        severity: formData.severity,
        donation_id: formData.donation_id ? parseInt(formData.donation_id) : undefined,
        description: formData.description.trim(),
      };

      const { data } = await api.post('/reports', payload);
      setSubmittedTicket(data.ticket);
      toast.success('Grievance report submitted successfully');
      setFormData({
        reported_role: 'VOLUNTEER',
        reported_name: '',
        category: 'FOOD_QUALITY',
        severity: 'MEDIUM',
        donation_id: '',
        description: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream dark:bg-night font-display">
      <Header />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {/* Header Title */}
        <div className="max-w-2xl">
          <p className="eyebrow text-primary">Trust & Safety Portal</p>
          <h1 className="mt-3 text-[32px] sm:text-[40px] font-extrabold tracking-tight text-brand-green dark:text-white leading-tight">
            Grievances & Incident Reporting
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft dark:text-white/60">
            AnnSparsh upholds absolute integrity across every food handoff. If you experienced food safety concerns, pickup no-shows, or misconduct, file a report below for immediate admin review.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex items-center gap-3 border-b border-brand-line dark:border-night-line">
          <button
            type="button"
            onClick={() => { setActiveTab('new'); setSubmittedTicket(null); }}
            className={`pb-3.5 text-[14px] font-bold transition-all relative ${
              activeTab === 'new'
                ? 'text-brand-green dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                : 'text-ink-soft dark:text-white/40 hover:text-brand-green dark:hover:text-white'
            }`}
          >
            File New Report
          </button>
          {user && (
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-3.5 text-[14px] font-bold transition-all relative ${
                activeTab === 'history'
                  ? 'text-brand-green dark:text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                  : 'text-ink-soft dark:text-white/40 hover:text-brand-green dark:hover:text-white'
              }`}
            >
              My Reported Issues
            </button>
          )}
        </div>

        {/* Tab 1: New Grievance Form */}
        {activeTab === 'new' && (
          <div className="mt-8">
            {submittedTicket ? (
              <Panel className="p-8 sm:p-10 text-center max-w-xl mx-auto">
                <div className="inline-grid place-items-center size-14 rounded-full bg-brand-mint text-brand-moss dark:bg-brand-emerald/20 dark:text-brand-emerald mb-4">
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h2 className="text-[22px] font-bold text-brand-green dark:text-white">
                  Report Received & Logged
                </h2>
                <p className="mt-2 text-[14px] text-ink-soft dark:text-white/60">
                  Your grievance ticket has been registered under reference:
                </p>
                <div className="mt-4 inline-block font-mono text-[18px] font-extrabold text-primary bg-primary-soft/50 dark:bg-primary/10 px-5 py-2 rounded-lg border border-primary/20">
                  {submittedTicket}
                </div>
                <p className="mt-4 text-[13px] text-ink-faint dark:text-white/40">
                  Our admin compliance team reviews incidents within 12–24 hours. Offending accounts may have their verification revoked.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Button variant="primary" onClick={() => setSubmittedTicket(null)}>
                    File Another Report
                  </Button>
                  {user && (
                    <Button variant="ghost" onClick={() => setActiveTab('history')}>
                      View My Reports
                    </Button>
                  )}
                </div>
              </Panel>
            ) : (
              <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Form details */}
                <div className="lg:col-span-2 space-y-7">
                  {/* Step 1: Who is being reported? */}
                  <Panel className="p-6">
                    <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green dark:text-white mb-3">
                      1. Who are you reporting?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, reported_role: r.id })}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            formData.reported_role === r.id
                              ? 'border-primary bg-primary-soft/40 dark:bg-primary/10 shadow-sm'
                              : 'border-brand-line dark:border-night-line bg-white dark:bg-night-card hover:border-ink-faint'
                          }`}
                        >
                          <span className="block text-[13.5px] font-bold text-brand-green dark:text-white">
                            {r.label}
                          </span>
                          <span className="block text-[11px] text-ink-soft dark:text-white/40 mt-1">
                            {r.hint}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/50 mb-1.5">
                        Name or Organization of Reported Entity (if known)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Volunteer Suresh Kumar, or Green Relief NGO"
                        className={inputClass}
                        value={formData.reported_name}
                        onChange={(e) => setFormData({ ...formData, reported_name: e.target.value })}
                      />
                    </div>
                  </Panel>

                  {/* Step 2: Category of Violation */}
                  <Panel className="p-6">
                    <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green dark:text-white mb-3">
                      2. Issue Category
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: c.id })}
                          className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                            formData.category === c.id
                              ? 'border-primary bg-primary-soft/40 dark:bg-primary/10 shadow-sm'
                              : 'border-brand-line dark:border-night-line bg-white dark:bg-night-card hover:border-ink-faint'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px] text-primary shrink-0 mt-0.5">
                            {c.icon}
                          </span>
                          <div>
                            <span className="block text-[13px] font-bold text-brand-green dark:text-white">
                              {c.label}
                            </span>
                            <span className="block text-[11.5px] text-ink-soft dark:text-white/45 mt-0.5">
                              {c.desc}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Panel>

                  {/* Step 3: Description & Reference */}
                  <Panel className="p-6">
                    <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green dark:text-white mb-3">
                      3. Incident Statement & Evidence
                    </label>

                    <div className="mb-4">
                      <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/50 mb-1.5">
                        Associated Donation ID (Optional)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 42 (if relates to a specific listing)"
                        className={inputClass}
                        value={formData.donation_id}
                        onChange={(e) => setFormData({ ...formData, donation_id: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/50 mb-1.5">
                        Statement / Detailed Description *
                      </label>
                      <textarea
                        rows={5}
                        required
                        placeholder="Please provide exact details: what time did this occur, what was communicated, and how did the violation take place?"
                        className={textareaClass}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </Panel>
                </div>

                {/* Right 1 Col: Severity & Submission */}
                <div className="space-y-6">
                  <Panel className="p-6">
                    <label className="block text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green dark:text-white mb-3">
                      Severity Rating
                    </label>
                    <div className="space-y-2.5">
                      {SEVERITIES.map((s) => (
                        <label
                          key={s.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.severity === s.id
                              ? 'border-primary bg-primary-soft/30 dark:bg-primary/10'
                              : 'border-brand-line dark:border-night-line hover:border-ink-faint'
                          }`}
                        >
                          <input
                            type="radio"
                            name="severity"
                            value={s.id}
                            checked={formData.severity === s.id}
                            onChange={() => setFormData({ ...formData, severity: s.id })}
                            className="mt-1 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="block text-[13px] font-bold text-brand-green dark:text-white">
                              {s.label}
                            </span>
                            <span className="block text-[11.5px] text-ink-soft dark:text-white/40">
                              {s.desc}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-brand-line dark:border-night-line">
                      <div className="text-[12px] text-ink-faint dark:text-white/40 space-y-2 mb-5">
                        <p className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-brand-emerald">verified_user</span>
                          Encrypted & reviewed by safety admins
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                          12–24h response target
                        </p>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        loading={submitting}
                        className="w-full h-11 justify-center text-[14px]"
                      >
                        Submit Grievance Report
                      </Button>
                    </div>
                  </Panel>

                  <Panel tone="sunken" className="p-5">
                    <h3 className="text-[13px] font-bold text-brand-green dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">shield</span>
                      Zero Tolerance Policy
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-ink-soft dark:text-white/50">
                      Food safety and donor-volunteer trust are paramount. Volunteers or NGOs found committing misconduct are immediately blacklisted and removed from the dispatch network.
                    </p>
                  </Panel>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: History of Reports */}
        {activeTab === 'history' && (
          <div className="mt-8">
            {loadingHistory ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-white/50 dark:bg-night-card animate-pulse" />
                ))}
              </div>
            ) : myReports.length === 0 ? (
              <EmptyState
                icon="fact_check"
                title="No reported issues on record"
                hint="Any grievances or dispute reports you file will be tracked here with live admin resolution updates."
              />
            ) : (
              <div className="space-y-4">
                {myReports.map((r) => (
                  <Panel key={r.id} className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-[13px] font-bold text-primary">
                            #REP-{String(r.id).padStart(5, '0')}
                          </span>
                          <StatusPill status={r.status} />
                          <StatusPill status={r.severity} />
                        </div>
                        <h3 className="mt-2 text-[15px] font-bold text-brand-green dark:text-white">
                          {r.category.replace('_', ' ')} • Reported Role: {r.reported_role}
                          {r.reported_name ? ` (${r.reported_name})` : ''}
                        </h3>
                      </div>
                      <span className="text-[12px] text-ink-faint dark:text-white/35">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <p className="mt-3 text-[13.5px] text-ink-soft dark:text-white/70 whitespace-pre-line leading-relaxed bg-brand-cream/50 dark:bg-night-soft/50 p-3.5 rounded-lg border border-brand-line/60 dark:border-night-line/60">
                      {r.description}
                    </p>

                    {r.food_type && (
                      <div className="mt-3 text-[12px] text-ink-faint dark:text-white/40">
                        Associated Listing: <span className="font-semibold text-brand-green dark:text-white">{r.food_type}</span> ({r.quantity})
                      </div>
                    )}

                    {r.admin_notes && (
                      <div className="mt-4 pt-3 border-t border-brand-line dark:border-night-line">
                        <p className="text-[11.5px] font-bold uppercase tracking-wider text-brand-moss dark:text-brand-emerald">
                          Admin Resolution Note:
                        </p>
                        <p className="mt-1 text-[13px] text-ink dark:text-white/90">
                          {r.admin_notes}
                        </p>
                      </div>
                    )}
                  </Panel>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
