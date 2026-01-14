import { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, KeyRound, Mail, Send } from 'lucide-react';
import { adminLogin, adminVerifyOtp } from '../services/auth';
import { API_BASE_URL, DEFAULT_ADMIN_EMAIL } from '../services/config';
import { setAdminToken } from '../services/token';

export default function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const canSendOtp = useMemo(() => email.trim().length > 3, [email]);
  const canVerifyOtp = useMemo(() => email.trim().length > 3 && otp.trim().length > 0, [email, otp]);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!canSendOtp) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await adminLogin(email.trim());
      setMessage(data?.message || 'OTP sent');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!canVerifyOtp) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await adminVerifyOtp(email.trim(), otp.trim());
      if (!data?.token) throw new Error('Token not received');
      setAdminToken(data.token);
      onLoggedIn?.(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        backgroundColor: '#f5f5f5',
        backgroundImage:
          'radial-gradient(circle at 20% 10%, rgba(15,23,42,0.08) 0 2px, transparent 3px), radial-gradient(circle at 80% 30%, rgba(15,23,42,0.07) 0 2px, transparent 3px), radial-gradient(circle at 30% 80%, rgba(15,23,42,0.06) 0 2px, transparent 3px), radial-gradient(circle at 70% 90%, rgba(15,23,42,0.05) 0 2px, transparent 3px)',
        backgroundSize: '220px 220px',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 ">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
              <KeyRound className="h-5 w-5 text-slate-900" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">Admin Login</h1>
            <p className="mt-2 text-sm text-slate-600">We’ll send you an OTP to verify.</p>
          </div>

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          {message ? (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <form className="mt-7 space-y-4" onSubmit={step === 'email' ? sendOtp : verifyOtp}>
            <div>
              <label className="block text-sm font-medium text-slate-800" htmlFor="email">
                Admin Email
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  disabled={isLoading || step === 'otp'}
                />
              </div>
            </div>

            {step === 'otp' ? (
              <div>
                <label className="block text-sm font-medium text-slate-800" htmlFor="otp">
                  OTP
                </label>
                <input
                  id="otp"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  disabled={isLoading}
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              {step === 'otp' ? (
                <button
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setMessage('');
                    setError('');
                  }}
                  disabled={isLoading}
                >
                  Change email
                </button>
              ) : (
                <a
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                  href={`${API_BASE_URL}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Backend health</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}

              <button
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
                type="submit"
                disabled={isLoading || (step === 'email' ? !canSendOtp : !canVerifyOtp)}
              >
                {isLoading ? (
                  'Please wait…'
                ) : step === 'email' ? (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send OTP</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="h-4 w-4" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
