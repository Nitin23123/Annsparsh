import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import BrandMark from './BrandMark';
import { Button, Field } from './dashboard/ui';
import { inputClass } from './dashboard/tokens';

const ROLES = {
  DONOR: {
    id: 'DONOR',
    name: 'Donor',
    blurb: 'For restaurants, households and caterers sharing surplus meals.',
    namePrompt: 'Full name / business name',
    namePlaceholder: 'e.g. Rahul Sharma, or Cafe Delight',
    emailPlaceholder: 'donor@example.com',
    demoEmail: 'donor@example.com',
    demoPass: 'password123',
  },
  NGO: {
    id: 'NGO',
    name: 'NGO',
    blurb: 'For registered non-profits collecting and distributing food.',
    namePrompt: 'Organisation name',
    namePlaceholder: 'e.g. Robin Hood Army Mumbai',
    emailPlaceholder: 'contact@ngo.org',
    demoEmail: 'ngo@example.com',
    demoPass: 'password123',
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Admin',
    blurb: 'Verification queue, organisation audit and platform metrics.',
    namePrompt: 'Full name',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'admin@annsparsh.com',
    demoEmail: 'admin@annsparsh.com',
    demoPass: 'password',
  },
};

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRole = (searchParams.get('role') || 'DONOR').toUpperCase();

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [selectedRole, setSelectedRole] = useState(ROLES[initialRole] ? initialRole : 'DONOR');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: selectedRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoPending, setDemoPending] = useState(null);

  useEffect(() => {
    const queryRole = searchParams.get('role');
    if (queryRole && ROLES[queryRole.toUpperCase()]) {
      setSelectedRole(queryRole.toUpperCase());
    }
    if (searchParams.get('mode') === 'register') {
      setIsLogin(false);
    } else if (searchParams.get('mode') === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  // One updater for both params. Building two URLSearchParams from the same
  // stale `searchParams` snapshot meant the second write clobbered the first.
  const updateParams = (updates) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(updates)) next.set(k, v);
        return next;
      },
      { replace: true }
    );
  };

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setFormData((prev) => ({ ...prev, role: roleKey }));
    setError('');
    updateParams({ role: roleKey });
  };

  const handleTabChange = (loginState) => {
    setIsLogin(loginState);
    setError('');

    // ADMIN can't self-register, so fall back to DONOR on the register tab.
    const nextRole = !loginState && selectedRole === 'ADMIN' ? 'DONOR' : selectedRole;
    if (nextRole !== selectedRole) {
      setSelectedRole(nextRole);
      setFormData((prev) => ({ ...prev, role: nextRole }));
    }

    updateParams({ mode: loginState ? 'login' : 'register', role: nextRole });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signIn = async (payload, endpoint) => {
    const { data } = await api.post(endpoint, payload);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    const role = data.user.role;
    if (role === 'NGO') navigate('/ngo-dashboard');
    else if (role === 'DONOR') navigate('/donor-dashboard');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/');
  };

  const handleDemoLogin = async (roleKey) => {
    const cfg = ROLES[roleKey];
    if (!cfg || demoPending || loading) return;

    setError('');
    setIsLogin(true);
    setSelectedRole(roleKey);
    setFormData((prev) => ({
      ...prev,
      email: cfg.demoEmail,
      password: cfg.demoPass,
      role: roleKey,
    }));
    updateParams({ role: roleKey, mode: 'login' });

    setDemoPending(roleKey);
    try {
      await signIn({ email: cfg.demoEmail, password: cfg.demoPass }, '/auth/login');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Could not sign in as the ${cfg.name} demo. Is the demo account seeded?`
      );
    } finally {
      setDemoPending(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: selectedRole === 'ADMIN' ? 'DONOR' : selectedRole,
          };

      await signIn(payload, endpoint);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const meta = ROLES[selectedRole] || ROLES.DONOR;
  const roleOptions = isLogin ? ['DONOR', 'NGO', 'ADMIN'] : ['DONOR', 'NGO'];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-brand-cream dark:bg-night font-display">
      {/* Left: the pitch. Hidden on small screens where the form is the whole job. */}
      <aside className="hidden lg:flex flex-col justify-between bg-brand-green dark:bg-night-soft p-12 xl:p-16">
        <Link to="/" className="flex items-center gap-2.5 self-start">
          <span className="grid place-items-center size-9 rounded-lg bg-primary text-white">
            <BrandMark className="size-[18px]" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tightest text-white">
            Ann<span className="text-primary">Sparsh</span>
          </span>
        </Link>

        <div className="max-w-md">
          <p className="eyebrow text-primary">Every handover, verified</p>
          <h2 className="mt-6 text-white text-[34px] leading-[1.12]">
            Food only moves when a 4-digit code matches.
          </h2>
          <p className="mt-6 text-[14.5px] leading-relaxed text-white/50">
            Donors list surplus. Verified NGOs claim it and send a volunteer. Nothing leaves the
            donor&rsquo;s door until the code checks out.
          </p>

          <div className="mt-10 flex gap-2" aria-hidden="true">
            {['7', '3', '0', '4'].map((d, i) => (
              <span key={i} className="otp-tile bg-white/10 border border-white/15 text-primary">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-6 text-[12.5px] text-white/35">
          <Link to="/role-selection" className="hover:text-primary transition-colors">
            Roles
          </Link>
          <Link to="/help" className="hover:text-primary transition-colors">
            Help
          </Link>
          <Link to="/shelters" className="hover:text-primary transition-colors">
            Shelters
          </Link>
        </div>
      </aside>

      {/* Right: the form */}
      <main className="flex flex-col justify-center px-5 sm:px-10 lg:px-14 xl:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <span className="grid place-items-center size-9 rounded-lg bg-brand-green dark:bg-primary text-white">
              <BrandMark className="size-[18px]" />
            </span>
            <span className="text-[17px] font-extrabold tracking-tightest text-brand-green dark:text-white">
              Ann<span className="text-primary">Sparsh</span>
            </span>
          </Link>

          <h1 className="text-[30px] leading-tight text-brand-green dark:text-white">
            {isLogin ? 'Welcome back.' : 'Create your account.'}
          </h1>
          <p className="mt-3 text-[14px] text-ink-soft dark:text-white/45">
            {isLogin
              ? 'Sign in to your portal.'
              : 'A minute to set up, then you can list or claim food.'}
          </p>

          {/* Role selector */}
          <div className="mt-8">
            <span className="block mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-ink-soft dark:text-white/45">
              {isLogin ? 'Signing in as' : 'Account type'}
            </span>
            <div className="flex gap-1 p-1 rounded-lg border border-brand-line dark:border-night-line">
              {roleOptions.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleSelect(key)}
                  aria-pressed={selectedRole === key}
                  className={`flex-1 h-9 rounded text-[12.5px] font-bold transition-colors ${
                    selectedRole === key
                      ? 'bg-brand-green dark:bg-primary text-white'
                      : 'text-ink-soft dark:text-white/50 hover:text-brand-green dark:hover:text-white'
                  }`}
                >
                  {ROLES[key].name}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[12px] text-ink-faint dark:text-white/30">{meta.blurb}</p>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-[13px] font-semibold"
            >
              {error}
            </p>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <Field label={meta.namePrompt}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={meta.namePlaceholder}
                  required
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Email">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={meta.emailPlaceholder}
                autoComplete="email"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded text-ink-faint dark:text-white/35 hover:text-brand-green dark:hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </Field>

            {!isLogin && selectedRole === 'NGO' && (
              <p className="px-4 py-3 rounded-lg bg-primary-soft dark:bg-primary/10 text-[12.5px] leading-relaxed text-primary">
                New NGO accounts go to an admin for verification before food-claim privileges are
                unlocked.
              </p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? 'Authenticating…' : isLogin ? 'Sign in' : `Register as ${meta.name}`}
            </Button>
          </form>

          <p className="mt-6 text-[13px] text-ink-soft dark:text-white/45">
            {isLogin ? 'No account yet? ' : 'Already registered? '}
            <button
              type="button"
              onClick={() => handleTabChange(!isLogin)}
              className="font-bold text-primary hover:text-primary-hover"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>

          {/* Demo credentials */}
          <div className="mt-10 pt-6 border-t border-brand-line dark:border-night-line">
            <p className="numeric text-[9.5px] uppercase tracking-[0.16em] text-ink-faint dark:text-white/30">
              One-click demo logins
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['DONOR', 'NGO', 'ADMIN'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDemoLogin(key)}
                  disabled={demoPending !== null || loading}
                  className="h-9 px-3.5 rounded-lg border border-brand-line dark:border-night-line text-[12.5px] font-bold text-ink-soft dark:text-white/50 hover:text-brand-green dark:hover:text-white hover:border-brand-green dark:hover:border-white/40 transition-colors disabled:opacity-55 disabled:pointer-events-none"
                >
                  {demoPending === key ? 'Signing in…' : `${ROLES[key].name} demo`}
                </button>
              ))}
            </div>

            <Link
              to="/verification-pending"
              className="inline-block mt-5 text-[12.5px] font-semibold text-ink-faint dark:text-white/30 hover:text-primary transition-colors"
            >
              Check NGO verification status
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
