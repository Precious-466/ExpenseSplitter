import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white font-extrabold text-xl shadow-lg shadow-brand-500/30 mb-3">
            S
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start splitting expenses with Splitly</p>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-brand-900/5 border border-black/5 dark:border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-shadow"
              />
            </div>
            {error && <p className="text-sm text-coral-600 bg-coral-500/10 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-3 transition-all shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
