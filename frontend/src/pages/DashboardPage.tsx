import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '../api/endpoints';
import type { GroupSummary } from '../types';
import CreateGroupModal from '../components/CreateGroupModal';

export default function DashboardPage() {
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    groupsApi
      .list()
      .then(setGroups)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const formatBalance = (balance: number) => {
    if (Math.abs(balance) < 0.01) return { text: 'settled up', color: 'text-ink-400' };
    if (balance > 0) return { text: `owed $${balance.toFixed(2)}`, color: 'text-moss-600 dark:text-moss-400' };
    return { text: `you owe $${Math.abs(balance).toFixed(2)}`, color: 'text-rust-600 dark:text-rust-400' };
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-ink-400 mb-1">Your account book</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">
            Groups
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + New group
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 rounded-sm bg-paper-200/60 dark:bg-ink-800/60 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-paper-300 dark:border-ink-600 rounded-sm">
          <div className="mx-auto mb-4 grid place-items-center h-12 w-11 rounded-b-lg bg-moss-600 text-paper-50 font-display text-xl shadow-[0_3px_0_var(--color-moss-900)]">
            S
          </div>
          <p className="text-ink-400 mb-3">No groups opened yet.</p>
          <button onClick={() => setShowModal(true)} className="text-moss-600 dark:text-moss-400 hover:underline text-sm font-semibold">
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g) => {
            const balance = formatBalance(g.yourBalance);
            return (
              <button
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="paper-card text-left p-5 pt-6 hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <h3 className="font-display font-semibold text-ink-900 dark:text-paper-100">{g.name}</h3>
                {g.description && (
                  <p className="ink-trail text-sm text-ink-400 mt-0.5" tabIndex={0}>
                    {g.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-ink-400 border border-paper-300 dark:border-ink-600 rounded-full px-2.5 py-1">
                    {g.memberCount} members
                  </span>
                  <span className={`text-sm font-mono-nums font-semibold ${balance.color}`}>{balance.text}</span>
                </div>
              </button>

            );
          })}
        </div>
      )}

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={(groupId) => {
            setShowModal(false);
            navigate(`/groups/${groupId}`);
          }}
        />
      )}
    </div>
  );
}
