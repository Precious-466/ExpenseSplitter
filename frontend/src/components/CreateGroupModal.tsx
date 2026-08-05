import { useState, type FormEvent } from 'react';
import { groupsApi } from '../api/endpoints';

interface Props {
  onClose: () => void;
  onCreated: (groupId: number) => void;
}

export default function CreateGroupModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emailsInput, setEmailsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const emails = emailsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const group = await groupsApi.create(name, description, emails);
      onCreated(group.id);
    } catch {
      setError('Could not create group. Check the member emails.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md paper-card p-6 pt-7">
        <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-paper-100 mb-4">New group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">Group name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trip to Goa"
              className="field-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="field-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 dark:text-ink-100 mb-1">
              Member emails (comma separated)
            </label>
            <input
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="bob@example.com, carol@example.com"
              className="field-input"
            />
            <p className="text-xs text-ink-400 mt-1">Members must already have a Splitly account.</p>
          </div>
          {error && <p className="text-sm text-rust-600 dark:text-rust-400 bg-rust-500/10 rounded-md px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md font-medium text-ink-600 dark:text-ink-100 hover:bg-paper-200 dark:hover:bg-ink-900 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-4 py-2">
              {loading ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
