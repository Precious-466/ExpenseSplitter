import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { resetToken } = await authApi.forgotPassword(email);
      setDevResetLink(resetToken ? `/reset-password?token=${resetToken}` : null);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="desk min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <span className="grid place-items-center h-11 w-10 rounded-b-lg bg-moss-600 text-paper-50 font-display font-bold text-lg shadow-[0_3px_0_var(--color-moss-900)] mb-4">
            S
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">
            Reset your password
          </h1>
          <p className="text-sm text-ink-400 mt-1 text-center">
            Enter your account email and we'll help you reset it.
          </p>
        </div>

        <div className="paper-card p-8">
          {submitted ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-600 dark:text-ink-100">
                If an account exists for <span className="font-medium">{email}</span>, a reset link has been created.
              </p>
              {devResetLink && (
                <div className="rounded-md border border-moss-500/30 bg-moss-500/10 p-3 text-sm">
                  <p className="text-ink-600 dark:text-ink-100 mb-1">
                    No email service is configured, so here's your reset link (dev mode only):
                  </p>
                  <Link to={devResetLink} className="text-moss-600 dark:text-moss-400 underline break-all">
                    {devResetLink}
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                />
              </div>
              {error && <p className="text-sm text-rust-600 dark:text-rust-400 bg-rust-500/10 rounded-md px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <p className="text-sm text-ink-400 mt-6 text-center">
            <Link to="/login" className="text-moss-600 dark:text-moss-400 hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
