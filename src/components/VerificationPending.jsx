import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import BrandMark from './BrandMark';
import { Button, Panel, StatusPill } from './dashboard/ui';
import { inputClass } from './dashboard/tokens';

const NGO_ID_TYPES = [
  { id: 'NGO_DARPAN', label: 'NITI Aayog DARPAN ID', placeholder: 'e.g. DL/2021/0284729' },
  { id: 'TRUST_REG', label: 'Trust / Society Reg. No.', placeholder: 'e.g. REG/SOC/2019/4819' },
  { id: '12A_80G', label: '12A / 80G Tax Exemption No.', placeholder: 'e.g. AABCT1234F2021' },
  { id: 'FCRA', label: 'FCRA Registration', placeholder: 'e.g. 231660123' },
];

const DONOR_ID_TYPES = [
  { id: 'FSSAI', label: 'FSSAI Food Safety License', placeholder: 'e.g. 10019022009876 (14 digits)' },
  { id: 'GSTIN', label: 'GSTIN / Business Number', placeholder: 'e.g. 27AAAAA0000A1Z5' },
  { id: 'GOVT_ID', label: 'Aadhaar / Govt ID', placeholder: 'e.g. XXXX-XXXX-1234' },
];

export default function VerificationPending() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpPreview, setDevOtpPreview] = useState(null);

  // Govt ID submission state
  const [idType, setIdType] = useState('NGO_DARPAN');
  const [idNumber, setIdNumber] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [submittingId, setSubmittingId] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      if (data.phone) setPhone(data.phone);
      if (data.id_type) setIdType(data.id_type);
      if (data.id_number) setIdNumber(data.id_number);
      if (data.id_document_url) setIdDocumentUrl(data.id_document_url);

      // Keep localStorage in sync
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      toast.error('Session expired. Please log in.');
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setSendingOtp(true);
    setDevOtpPreview(null);
    try {
      const { data } = await api.post('/auth/send-phone-otp', { phone });
      setOtpSent(true);
      setDevOtpPreview(data.otp);
      toast.info(`OTP sent! (Test OTP: ${data.otp})`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setVerifyingOtp(true);
    try {
      const { data } = await api.post('/auth/verify-phone-otp', { phone, otp });
      toast.success(data.message || 'Mobile number verified!');
      setOtp('');
      setDevOtpPreview(null);
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmitGovtId = async (e) => {
    e.preventDefault();
    if (!idNumber.trim()) {
      toast.error('Please enter your registration or ID number');
      return;
    }

    setSubmittingId(true);
    try {
      const { data } = await api.post('/auth/submit-verification', {
        id_type: idType,
        id_number: idNumber.trim(),
        id_document_url: idDocumentUrl.trim() || undefined,
        phone,
      });
      toast.success(data.message);
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit verification');
    } finally {
      setSubmittingId(false);
    }
  };

  const handleFileUploadMock = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, this uploads to S3/Cloud Storage. Here we provide a mock certificate reference.
      setIdDocumentUrl(`doc_${Date.now()}_${file.name}`);
      toast.success(`Attached document: ${file.name}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-cream dark:bg-night">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const isNgo = user?.role === 'NGO';
  const isVerified = user?.is_verified;
  const isPhoneVerified = user?.phone_verified;
  const isRejected = user?.verification_status === 'REJECTED';
  const idOptions = isNgo ? NGO_ID_TYPES : DONOR_ID_TYPES;
  const selectedTypeObj = idOptions.find((t) => t.id === idType) || idOptions[0];

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-night font-display flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span className="grid place-items-center size-9 rounded-lg bg-brand-green dark:bg-primary text-white">
            <BrandMark className="size-[18px]" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tightest text-brand-green dark:text-white">
            Ann<span className="text-primary">Sparsh</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[12.5px] text-ink-soft dark:text-white/50 hidden sm:inline">
            Logged in as <strong className="text-brand-green dark:text-white">{user?.name}</strong> ({user?.role})
          </span>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/auth');
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="max-w-[850px] w-full mx-auto px-5 sm:px-8 py-10">
        {/* Banner if already verified */}
        {isVerified ? (
          <Panel className="p-8 sm:p-10 text-center">
            <div className="inline-grid place-items-center size-14 rounded-full bg-brand-mint text-brand-moss dark:bg-brand-emerald/20 dark:text-brand-emerald mb-4">
              <span className="material-symbols-outlined text-[34px]">verified</span>
            </div>
            <h1 className="text-[26px] font-extrabold text-brand-green dark:text-white">
              Account Verified & Active!
            </h1>
            <p className="mt-2 text-[14.5px] text-ink-soft dark:text-white/60 max-w-md mx-auto">
              Your credentials and mobile identity have been successfully approved by the AnnSparsh safety network.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button
                variant="primary"
                onClick={() => navigate(isNgo ? '/ngo-dashboard' : '/donor-dashboard')}
                className="h-11 px-8 text-[14px]"
              >
                Go to {isNgo ? 'NGO Dashboard' : 'Donor Dashboard'}
              </Button>
            </div>
          </Panel>
        ) : (
          <div>
            {/* Title & Status */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <p className="eyebrow text-primary">Identity & Trust Verification</p>
                <h1 className="mt-2 text-[28px] sm:text-[34px] font-extrabold text-brand-green dark:text-white">
                  {isNgo ? 'NGO Organization Verification' : 'Donor Contact Verification'}
                </h1>
                <p className="mt-2 text-[14px] text-ink-soft dark:text-white/55 max-w-xl">
                  {isNgo
                    ? 'To claim surplus food and protect the recipient network, all NGOs must verify a primary mobile phone and submit government registration details.'
                    : 'To list surplus meals, please complete mobile phone OTP verification.'}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <StatusPill status={user?.verification_status || 'PENDING'} />
                <span className="text-[11.5px] font-medium text-ink-faint dark:text-white/35">
                  Role: {user?.role}
                </span>
              </div>
            </div>

            {/* Rejection Alert if applicable */}
            {isRejected && (
              <div className="mb-8 p-4.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3.5">
                <span className="material-symbols-outlined text-red-600 text-[22px] shrink-0 mt-0.5">
                  warning
                </span>
                <div>
                  <h4 className="text-[13.5px] font-bold text-red-800 dark:text-red-300">
                    Verification Update Required
                  </h4>
                  <p className="text-[12.5px] text-red-700 dark:text-red-400 mt-1">
                    {user?.rejection_reason || 'Previous documents were incomplete or invalid. Please re-submit valid credentials below.'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Step 1: Mobile Phone OTP Verification */}
              <Panel className="p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid place-items-center size-8 rounded-full text-[13px] font-bold ${
                      isPhoneVerified
                        ? 'bg-brand-mint text-brand-moss dark:bg-brand-emerald/20 dark:text-brand-emerald'
                        : 'bg-primary-soft text-primary dark:bg-primary/20'
                    }`}>
                      {isPhoneVerified ? '✓' : '1'}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold text-brand-green dark:text-white">
                        Mobile Phone Number Verification
                      </h3>
                      <p className="text-[12px] text-ink-soft dark:text-white/45">
                        Used for urgent food pickup notifications and donor-volunteer coordination.
                      </p>
                    </div>
                  </div>
                  {isPhoneVerified && (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-brand-moss dark:text-brand-emerald bg-brand-mint dark:bg-brand-emerald/15 px-2.5 py-1 rounded">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Verified
                    </span>
                  )}
                </div>

                {!isPhoneVerified ? (
                  <div className="space-y-4 pt-2">
                    <form onSubmit={handleSendOtp} className="flex flex-wrap sm:flex-nowrap gap-3">
                      <input
                        type="tel"
                        required
                        placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        loading={sendingOtp}
                        className="shrink-0 h-11 px-6 text-[13px]"
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                    </form>

                    {/* Developer/Testing Helper Alert */}
                    {devOtpPreview && (
                      <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-[12.5px]">
                        <span className="text-amber-800 dark:text-amber-300">
                          Dev SMS Simulator: Generated Code is <strong className="font-mono text-[14px] text-primary">{devOtpPreview}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOtp(devOtpPreview)}
                          className="font-bold text-primary hover:underline"
                        >
                          Auto-fill
                        </button>
                      </div>
                    )}

                    {otpSent && (
                      <form onSubmit={handleVerifyOtp} className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Enter 6-digit OTP code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className={`${inputClass} font-mono tracking-widest text-[15px]`}
                        />
                        <Button
                          type="submit"
                          variant="forest"
                          loading={verifyingOtp}
                          className="shrink-0 h-11 px-6 text-[13px]"
                        >
                          Verify OTP
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-brand-cream dark:bg-night-soft border border-brand-line dark:border-night-line flex items-center justify-between text-[13px]">
                    <span className="text-ink-soft dark:text-white/60">
                      Verified Contact: <strong className="font-mono text-brand-green dark:text-white">{user?.phone}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[12px] font-bold text-primary hover:underline"
                    >
                      Update Number
                    </button>
                  </div>
                )}
              </Panel>

              {/* Step 2: Govt ID Verification (Required for NGO, Optional for Donor) */}
              <Panel className="p-6 sm:p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="grid place-items-center size-8 rounded-full text-[13px] font-bold bg-primary-soft text-primary dark:bg-primary/20">
                    2
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-brand-green dark:text-white">
                      {isNgo ? 'Govt Registration & Legal Proof (NGO)' : 'Govt / Business ID (Optional for Donors)'}
                    </h3>
                    <p className="text-[12px] text-ink-soft dark:text-white/45">
                      {isNgo
                        ? 'Submit your NITI Aayog DARPAN ID or Society Registration to unlock food requests.'
                        : 'Commercial caterers or food establishments can provide FSSAI / GSTIN for verified badge.'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmitGovtId} className="space-y-4">
                  {/* Select ID Type */}
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/50 mb-1.5">
                      Registration / Document Type
                    </label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className={inputClass}
                    >
                      {idOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ID / Reg Number */}
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/50 mb-1.5">
                      {selectedTypeObj.label} Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedTypeObj.placeholder}
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Upload proof / link */}
                  <div>
                    <label className="block text-[12px] font-semibold text-ink-soft dark:text-white/50 mb-1.5">
                      Upload Certificate / Document Proof (PDF or Image)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brand-line dark:border-night-line bg-white dark:bg-night-card hover:bg-brand-cream/50 text-[12.5px] font-semibold text-ink-soft dark:text-white/70 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Choose Document
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={handleFileUploadMock}
                        />
                      </label>
                      {idDocumentUrl && (
                        <span className="text-[12px] text-brand-moss dark:text-brand-emerald font-semibold truncate">
                          ✓ {idDocumentUrl}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      variant="forest"
                      loading={submittingId}
                      className="h-11 px-8 text-[13.5px]"
                    >
                      {isRejected ? 'Re-Submit Verification Documents' : 'Submit for Admin Review'}
                    </Button>
                  </div>
                </form>
              </Panel>

              {/* Status footer / Refresh */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={fetchUser}>
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Check Latest Status
                  </Button>
                </div>
                <Link
                  to="/grievances"
                  className="text-[12.5px] font-medium text-ink-soft dark:text-white/40 hover:text-primary transition-colors"
                >
                  Have an issue? Contact Trust & Safety
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1100px] mx-auto px-5 sm:px-8 py-6 text-center text-[12px] text-ink-faint dark:text-white/30 border-t border-brand-line dark:border-night-line">
        AnnSparsh Trust & Identity Backbone • Securing every meal handoff with verified transparency.
      </footer>
    </div>
  );
}
