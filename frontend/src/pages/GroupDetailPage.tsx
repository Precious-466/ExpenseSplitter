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
import CategoryIcon from '../components/CategoryIcon';

const COLORS = ['#3f6b52', '#bd5b34', '#b98a2e', '#5b7268', '#6fa085', '#d17a54', '#33473d'];

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
        <div className="h-8 w-56 rounded-sm bg-paper-200/60 dark:bg-ink-800/60 animate-pulse" />
        <div className="h-24 rounded-sm bg-paper-200/60 dark:bg-ink-800/60 animate-pulse" />
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
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 dark:text-paper-100">
          {group.name}
        </h1>
        <button onClick={() => setShowAddExpense(true)} className="btn-primary">
          + Add expense
        </button>
      </div>
      {group.description && <p className="text-sm text-ink-400 mb-6">{group.description}</p>}

      <div className="inline-flex gap-1 border-b-2 border-paper-300 dark:border-ink-600 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold -mb-0.5 border-b-2 transition-colors ${
              tab === t.key
                ? 'border-moss-600 text-moss-700 dark:text-moss-400'
                : 'border-transparent text-ink-400 hover:text-ink-600 dark:hover:text-ink-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'expenses' && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <p className="text-ink-400 text-sm">No expenses yet. Add the first one.</p>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} className="paper-card p-4 pt-5 flex items-center gap-4">
                <div className="grid place-items-center h-10 w-10 rounded-md bg-moss-500/10 text-moss-600 dark:text-moss-400 shrink-0">
                  <CategoryIcon category={exp.category} />
                </div>
                <div className="flex-1 min-w-0 leader-row">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 dark:text-paper-100 truncate">{exp.description}</p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {exp.category} · paid by {exp.paidByName} · {new Date(exp.incurredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="leader-fill hidden sm:block" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono-nums font-semibold text-ink-900 dark:text-paper-100">
                    ${exp.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-xs font-medium text-rust-500 hover:text-rust-700 hover:bg-rust-500/10 rounded-full px-2 py-1 transition-colors"
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
            <h3 className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-400 mb-3">Net balances</h3>
            <div className="space-y-2">
              {balances.balances.map((b) => (
                <div key={b.userId} className="leader-row paper-card px-4 py-3">
                  <span className="text-sm text-ink-700 dark:text-ink-100 font-medium">{b.userName}</span>
                  <span className="leader-fill" />
                  <span
                    className={`text-sm font-mono-nums font-bold ${
                      b.netBalance > 0.01
                        ? 'text-moss-600 dark:text-moss-400'
                        : b.netBalance < -0.01
                        ? 'text-rust-600 dark:text-rust-400'
                        : 'text-ink-400'
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
            <h3 className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-400 mb-3">Suggested settlements</h3>
            {balances.suggestedSettlements.length === 0 ? (
              <p className="text-sm text-ink-400">
                <span className="stamp text-moss-600 dark:text-moss-400">Settled</span>
              </p>
            ) : (
              <div className="space-y-2">
                {balances.suggestedSettlements.map((t, idx) => (
                  <div key={idx} className="paper-card px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-ink-700 dark:text-ink-100">
                      {t.fromUserName} <span className="text-moss-500">→</span> {t.toUserName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono-nums font-bold text-ink-900 dark:text-paper-100">
                        ${t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleSettle(t.fromUserId, t.toUserId, t.amount)}
                        className="text-xs font-semibold text-moss-600 dark:text-moss-400 hover:bg-moss-500/10 rounded-full px-2.5 py-1 transition-colors"
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
          <div className="paper-card p-5 pt-6">
            <h3 className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-400 mb-3">Spending by category</h3>
            {categoryData.length === 0 ? (
              <p className="text-sm text-ink-400">No data yet.</p>
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
          <div className="paper-card p-5 pt-6">
            <h3 className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-400 mb-3">Monthly trend</h3>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-ink-400">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                  <Bar dataKey="total" fill="#3f6b52" radius={[3, 3, 0, 0]} />
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
