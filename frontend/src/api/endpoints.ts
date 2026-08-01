import client from './client';
import type {
  AuthResponse,
  CategoryBreakdown,
  Expense,
  GroupBalances,
  GroupDetail,
  GroupSummary,
  MonthlyTrend,
  SplitType,
  ExpenseCategory,
} from '../types';

export const authApi = {
  register: (name: string, email: string, password: string) =>
    client.post<AuthResponse>('/auth/register', { name, email, password }).then((r) => r.data),
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  forgotPassword: (email: string) =>
    client.post<{ resetToken: string | null }>('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, newPassword: string) =>
    client.post('/auth/reset-password', { token, newPassword }),
};

export const groupsApi = {
  list: () => client.get<GroupSummary[]>('/groups').then((r) => r.data),
  get: (id: number) => client.get<GroupDetail>(`/groups/${id}`).then((r) => r.data),
  create: (name: string, description: string, memberEmails: string[]) =>
    client.post<GroupDetail>('/groups', { name, description, memberEmails }).then((r) => r.data),
  addMember: (id: number, email: string) => client.post(`/groups/${id}/members`, { email }),
  balances: (id: number) => client.get<GroupBalances>(`/groups/${id}/balances`).then((r) => r.data),
  recordSettlement: (id: number, fromUserId: number, toUserId: number, amount: number) =>
    client.post(`/groups/${id}/settlements`, { fromUserId, toUserId, amount }),
};

export const expensesApi = {
  list: (groupId: number) => client.get<Expense[]>(`/groups/${groupId}/expenses`).then((r) => r.data),
  create: (
    groupId: number,
    data: {
      description: string;
      amount: number;
      category: ExpenseCategory;
      splitType: SplitType;
      paidByUserId: number;
      participants: { userId: number; value: number | null }[];
    },
  ) => client.post<Expense>(`/groups/${groupId}/expenses`, data).then((r) => r.data),
  delete: (groupId: number, expenseId: number) => client.delete(`/groups/${groupId}/expenses/${expenseId}`),
  categoryBreakdown: (groupId: number) =>
    client.get<CategoryBreakdown[]>(`/groups/${groupId}/analytics/by-category`).then((r) => r.data),
  monthlyTrend: (groupId: number) =>
    client.get<MonthlyTrend[]>(`/groups/${groupId}/analytics/monthly`).then((r) => r.data),
};
