export type SplitType = 'Equal' | 'Exact' | 'Percentage';
export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Accommodation'
  | 'Utilities'
  | 'Entertainment'
  | 'Shopping'
  | 'Other';

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
}

export interface GroupSummary {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  yourBalance: number;
}

export interface GroupMember {
  userId: number;
  name: string;
  email: string;
}

export interface GroupDetail {
  id: number;
  name: string;
  description?: string;
  members: GroupMember[];
}

export interface ExpenseShare {
  userId: number;
  userName: string;
  amountOwed: number;
  isSettled: boolean;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  splitType: SplitType;
  paidByUserId: number;
  paidByName: string;
  incurredAt: string;
  shares: ExpenseShare[];
}

export interface MemberBalance {
  userId: number;
  userName: string;
  netBalance: number;
}

export interface Transaction {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
}

export interface GroupBalances {
  balances: MemberBalance[];
  suggestedSettlements: Transaction[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
}
