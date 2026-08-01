import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { expensesApi, groupsApi } from '../api/endpoints';
import type { CategoryBreakdown, Expense, GroupBalances, GroupDetail, MonthlyTrend } from '../types';
import { useAuth } from '../context/AuthContext';
import AddExpenseModal from '../components/AddExpenseModal';

const COLORS = ['#18b384', '#fb6f4c', '#0ea5e9', '#a855f7', '#f59e0b', '#0e916c', '#64748b'];

const CATEGORY_ICON: Record<string, string> = {
  Food: '🍽️',
  Transport: '🚕',
  Accommodation: '🏠',
  Utilities: '💡',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Other: '✦',
};

type Tab = 'expenses' | 'balances' | 'analytics';

export default function GroupDetailPage() {
  const { id } = useParams();
  const groupId = parseInt(id!);
  const { user } = useAuth();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<GroupBalances | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([]);
  const [tab, setTab] = useState<Tab>('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      groupsApi.get(groupId),
      expensesApi.list(groupId),
      groupsApi.balances(groupId),
      expensesApi.categoryBreakdown(groupId),
      expensesApi.monthlyTrend(groupId),
    ])
      .then(([g, e, b, c, m]) => {
        setGroup(g);
        setExpenses(e);
        setBalances(b);
        setCategoryData(c.filter((d) => d.total > 0));
        setMonthlyData(m);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [groupId]);

  const handleSettle = async (fromUserId: number, toUserId: number, amount: number) => {
    await groupsApi.recordSettlement(groupId, fromUserId, toUserId, amount);
    loadAll();
  };

  const handleDeleteExpense = async (expenseId: number) => {
    await expensesApi.delete(groupId, expenseId);
    loadAll();
  };

  if (loading || !group) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        <div className="h-24 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'expenses', label: 'Expenses' },
    { key: 'balances', label: 'Balances' },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 dark:text-white">{group.name}</h1>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2.5 text-sm rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 transition-all"
        >
          + Add expense
        </button>
      </div>
      {group.description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{group.description}</p>}

      <div className="inline-flex gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-full p-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'expenses' && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <p className="text-slate-500 text-sm">No expenses yet. Add the first one.</p>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-slate-900/70 border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-brand-500/10 text-lg shrink-0">
                  {CATEGORY_ICON[exp.category] ?? '✦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{exp.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exp.category} · paid by {exp.paidByName} · {new Date(exp.incurredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900 dark:text-white">${exp.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-xs font-medium text-coral-500 hover:text-coral-700 hover:bg-coral-500/10 rounded-full px-2 py-1 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'balances' && balances && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Net balances</h3>
            <div className="space-y-2">
              {balances.balances.map((b) => (
                <div
                  key={b.userId}
                  className="flex items-center justify-between bg-white dark:bg-slate-900/70 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 shadow-sm"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{b.userName}</span>
                  <span
                    className={`text-sm font-bold ${
                      b.netBalance > 0.01
                        ? 'text-brand-600 dark:text-brand-400'
                        : b.netBalance < -0.01
                        ? 'text-coral-600 dark:text-coral-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {b.netBalance > 0.01 ? '+' : ''}
                    ${b.netBalance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Suggested settlements</h3>
            {balances.suggestedSettlements.length === 0 ? (
              <p className="text-sm text-slate-400">Everyone is settled up. 🎉</p>
            ) : (
              <div className="space-y-2">
                {balances.suggestedSettlements.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white dark:bg-slate-900/70 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 shadow-sm"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t.fromUserName} <span className="text-brand-500">→</span> {t.toUserName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ${t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleSettle(t.fromUserId, t.toUserId, t.amount)}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 rounded-full px-2.5 py-1 transition-colors"
                      >
                        Mark settled
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900/70 border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Spending by category</h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="total" nameKey="category" outerRadius={90} label>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900/70 border border-black/5 dark:border-white/10 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Monthly trend</h3>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                  <Bar dataKey="total" fill="#18b384" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {showAddExpense && user && (
        <AddExpenseModal
          groupId={groupId}
          members={group.members}
          currentUserId={user.userId}
          onClose={() => setShowAddExpense(false)}
          onCreated={() => {
            setShowAddExpense(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
}
