import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/endpoints';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setError('This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="desk min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm paper-card p-8 text-center">
          <p className="text-sm text-ink-600 dark:text-ink-100 mb-4">Missing or invalid reset link.</p>
          <Link to="/forgot-password" className="text-moss-600 dark:text-moss-400 hover:underline text-sm font-medium">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="desk min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <span className="grid place-items-center h-11 w-10 rounded-b-lg bg-moss-600 text-paper-50 font-display font-bold text-lg shadow-[0_3px_0_var(--color-moss-900)] mb-4">
            S
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">
            Set a new password
          </h1>
          <p className="text-sm text-ink-400 mt-1">Choose a new password for your account.</p>
        </div>

        <div className="paper-card p-8">
          {done ? (
            <p className="text-sm text-moss-600 dark:text-moss-400 font-medium">
              Password updated. Redirecting to login…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">New password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field-input"
                />
              </div>
              {error && <p role="alert" className="text-sm text-rust-600 dark:text-rust-400 bg-rust-500/10 rounded-md px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
