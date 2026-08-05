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
    <div className="desk min-h-screen">
      <header className="sticky top-0 z-40 bg-paper-50/95 dark:bg-ink-900/95 backdrop-blur-sm border-b-2 border-ink-900/10 dark:border-paper-100/10">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid place-items-center h-8 w-7 rounded-b-md bg-moss-600 text-paper-50 font-display font-bold text-sm shadow-[0_2px_0_var(--color-moss-900)] group-hover:-translate-y-px transition-transform">
              S
            </span>
            <span className="font-display font-semibold text-lg tracking-tight text-ink-900 dark:text-paper-100">
              Splitly
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pr-2">
              <span className="grid place-items-center h-7 w-7 rounded-full border border-rust-500/40 text-rust-600 dark:text-rust-400 font-mono-nums text-xs font-semibold">
                {initials(user?.name)}
              </span>
              <span className="text-sm text-ink-600 dark:text-ink-100">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-ink-400 hover:text-moss-600 dark:hover:text-moss-400 transition-colors px-3 py-1.5 rounded-md hover:bg-moss-500/10"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="main-ledger max-w-4xl mx-auto py-10">
        <Outlet />
      </main>
    </div>
  );
}
