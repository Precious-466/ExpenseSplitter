import { useState, type FormEvent } from 'react';
import { expensesApi } from '../api/endpoints';
import type { ExpenseCategory, GroupMember, SplitType } from '../types';

interface Props {
  groupId: number;
  members: GroupMember[];
  currentUserId: number;
  onClose: () => void;
  onCreated: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Accommodation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Other',
];

export default function AddExpenseModal({ groupId, members, currentUserId, onClose, onCreated }: Props) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [splitType, setSplitType] = useState<SplitType>('Equal');
  const [paidByUserId, setPaidByUserId] = useState(currentUserId);
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set(members.map((m) => m.userId)));
  const [values, setValues] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMember = (userId: number) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const participants = members
      .filter((m) => selectedMembers.has(m.userId))
      .map((m) => ({
        userId: m.userId,
        value: splitType === 'Equal' ? null : parseFloat(values[m.userId] ?? '0'),
      }));

    if (participants.length === 0) {
      setError('Select at least one participant.');
      return;
    }

    setLoading(true);
    try {
      await expensesApi.create(groupId, {
        description,
        amount: parseFloat(amount),
        category,
        splitType,
        paidByUserId,
        participants,
      });
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data ?? 'Could not add expense. Check the split values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50 overflow-y-auto py-8">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dinner at the beach shack"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paid by</label>
            <select
              value={paidByUserId}
              onChange={(e) => setPaidByUserId(parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Split</label>
            <div className="flex gap-2 mb-3">
              {(['Equal', 'Exact', 'Percentage'] as SplitType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSplitType(t)}
                  className={`px-3 py-1.5 text-xs rounded-full border ${
                    splitType === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.userId} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(m.userId)}
                    onChange={() => toggleMember(m.userId)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{m.name}</span>
                  {splitType !== 'Equal' && selectedMembers.has(m.userId) && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder={splitType === 'Percentage' ? '%' : '$'}
                      value={values[m.userId] ?? ''}
                      onChange={(e) => setValues((prev) => ({ ...prev, [m.userId]: e.target.value }))}
                      className="w-24 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-2 py-1 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium"
            >
              {loading ? 'Adding...' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
