import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import AppPage from './dashboard/AppPage';
import { Button, Field, Panel } from './dashboard/ui';
import { inputClass } from './dashboard/tokens';

export default function UserProfile() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const dashboardLink = storedUser.role === 'NGO' ? '/ngo-dashboard' : '/donor-dashboard';

  const [user, setUser] = useState({ name: '', email: '', phone: '', address: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch {
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name: user.name,
        address: user.address,
        phone: user.phone,
      });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.user.name }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppPage
      back={dashboardLink}
      backLabel="Back to dashboard"
      title="Profile & settings"
      subtitle="How donors and NGOs see you."
      width="max-w-3xl"
    >
      {loading ? (
        <p className="text-[13px] text-ink-soft dark:text-white/40">Loading profile…</p>
      ) : (
        <Panel className="p-6 sm:p-8">
          <div className="flex items-center gap-4 pb-6 border-b border-brand-line dark:border-night-line">
            <span className="grid place-items-center size-14 shrink-0 rounded-full bg-brand-green dark:bg-primary text-white text-[20px] font-bold">
              {(user.name || '?')[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-[17px] font-bold text-brand-green dark:text-white truncate">
                {user.name || 'Unnamed account'}
              </p>
              <p className="numeric mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-faint dark:text-white/30">
                {user.role}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                name="email"
                value={user.email}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </Field>

            <Field label="Phone">
              <input
                type="tel"
                name="phone"
                value={user.phone || ''}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </Field>

            <Field label="Location">
              <input
                type="text"
                name="address"
                value={user.address || ''}
                onChange={handleChange}
                placeholder="Your address"
                className={inputClass}
              />
            </Field>
          </div>

          <p className="mt-3 text-[11.5px] text-ink-faint dark:text-white/30">
            Your email is your login and cannot be changed.
          </p>

          <div className="mt-8 pt-6 border-t border-brand-line dark:border-night-line flex justify-end gap-3">
            <Link
              to={dashboardLink}
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-brand-line dark:border-night-line text-[12.5px] font-bold text-ink-soft dark:text-white/55 hover:text-brand-green dark:hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Panel>
      )}
    </AppPage>
  );
}
