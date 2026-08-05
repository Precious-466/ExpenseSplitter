import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
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
            Welcome back
          </h1>
          <p className="text-sm text-ink-400 mt-1">Log in to your ledger</p>
        </div>

        <div className="paper-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
              />
            </div>
            {error && <p role="alert" className="text-sm text-rust-600 dark:text-rust-400 bg-rust-500/10 rounded-md px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <p className="text-sm text-ink-400 mt-4 text-center">
            <Link to="/forgot-password" className="text-moss-600 dark:text-moss-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </p>
        </div>
        <p className="text-sm text-ink-400 mt-6 text-center">
          No account?{' '}
          <Link to="/register" className="text-moss-600 dark:text-moss-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
