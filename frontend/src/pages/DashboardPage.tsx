import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '../api/endpoints';
import type { GroupSummary } from '../types';
import CreateGroupModal from '../components/CreateGroupModal';

const CARD_ACCENTS = [
  'from-brand-400 to-brand-600',
  'from-coral-400 to-coral-600',
  'from-sky-400 to-sky-600',
  'from-violet-400 to-violet-600',
];

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
    if (Math.abs(balance) < 0.01) return { text: 'settled up', color: 'text-slate-400' };
    if (balance > 0) return { text: `you are owed $${balance.toFixed(2)}`, color: 'text-brand-600 dark:text-brand-400' };
    return { text: `you owe $${Math.abs(balance).toFixed(2)}`, color: 'text-coral-600 dark:text-coral-400' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 dark:text-white">Your groups</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keep track of who owes who, together.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 transition-all"
        >
          + New group
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-brand-200 dark:border-brand-800/50 rounded-2xl bg-white/50 dark:bg-slate-900/30">
          <div className="mx-auto mb-4 grid place-items-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white text-2xl shadow-lg shadow-brand-500/25">
            ✦
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-3">You haven't joined any groups yet.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-brand-600 dark:text-brand-400 hover:underline text-sm font-semibold"
          >
            Create your first group
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g, i) => {
            const balance = formatBalance(g.yourBalance);
            return (
              <button
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="group relative text-left overflow-hidden bg-white dark:bg-slate-900/70 border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-brand-900/10 hover:-translate-y-0.5 transition-all"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`} />
                <h3 className="font-bold text-slate-900 dark:text-white">{g.name}</h3>
                {g.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{g.description}</p>}
                <div className="flex items-center justify-between mt-5">
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1">
                    {g.memberCount} members
                  </span>
                  <span className={`text-sm font-semibold ${balance.color}`}>{balance.text}</span>
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
