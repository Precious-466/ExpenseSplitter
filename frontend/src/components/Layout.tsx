import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || name[0]?.toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#0b1512]/80 border-b border-brand-900/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center h-8 w-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white font-extrabold text-sm shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
              S
            </span>
            <span className="text-lg font-extrabold tracking-tight text-brand-900 dark:text-brand-100">
              Splitly
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-2">
              <span className="grid place-items-center h-7 w-7 rounded-full bg-coral-500/15 text-coral-600 dark:text-coral-400 text-xs font-bold">
                {initials(user?.name)}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-slate-500 hover:text-brand-700 dark:hover:text-brand-300 transition-colors px-3 py-1.5 rounded-full hover:bg-brand-500/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}
