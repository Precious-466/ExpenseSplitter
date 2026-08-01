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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#64748b'];

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

  if (loading || !group) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{group.name}</h1>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          + Add expense
        </button>
      </div>
      {group.description && <p className="text-sm text-slate-500 mb-6">{group.description}</p>}

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        {(['expenses', 'balances', 'analytics'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {t}
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
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{exp.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {exp.category} · paid by {exp.paidByName} · {new Date(exp.incurredAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900 dark:text-white">${exp.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-xs text-red-500 hover:text-red-700"
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
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Net balances</h3>
            <div className="space-y-2">
              {balances.balances.map((b) => (
                <div
                  key={b.userId}
                  className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{b.userName}</span>
                  <span
                    className={`text-sm font-medium ${
                      b.netBalance > 0.01 ? 'text-emerald-600' : b.netBalance < -0.01 ? 'text-red-600' : 'text-slate-400'
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
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Suggested settlements</h3>
            {balances.suggestedSettlements.length === 0 ? (
              <p className="text-sm text-slate-400">Everyone is settled up.</p>
            ) : (
              <div className="space-y-2">
                {balances.suggestedSettlements.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {t.fromUserName} → {t.toUserName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        ${t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleSettle(t.fromUserId, t.toUserId, t.amount)}
                        className="text-xs text-indigo-600 hover:underline"
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
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Spending by category</h3>
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
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Monthly trend</h3>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
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
