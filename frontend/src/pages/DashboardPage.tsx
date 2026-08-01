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
    if (Math.abs(balance) < 0.01) return { text: 'settled up', color: 'text-slate-400' };
    if (balance > 0) return { text: `you are owed $${balance.toFixed(2)}`, color: 'text-emerald-600' };
    return { text: `you owe $${Math.abs(balance).toFixed(2)}`, color: 'text-red-600' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Your groups</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          + New group
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
          <p className="text-slate-500 mb-3">You haven't joined any groups yet.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:underline text-sm font-medium">
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
                className="text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white">{g.name}</h3>
                {g.description && <p className="text-sm text-slate-500 mt-0.5">{g.description}</p>}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">{g.memberCount} members</span>
                  <span className={`text-sm font-medium ${balance.color}`}>{balance.text}</span>
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
