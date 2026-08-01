import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-indigo-600">
            Splitly
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
