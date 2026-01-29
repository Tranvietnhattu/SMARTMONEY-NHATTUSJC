export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: TransactionType;
  isDefault?: boolean;
}

export type PaymentSource = 'Tiền mặt' | 'Ví điện tử' | 'Ngân hàng';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string; // ISO format
  source: PaymentSource;
  note: string;
  createdAt: number;
  isLocked?: boolean;
}

export interface FinancialJar {
  id: string;
  name: string;
  label: string;
  percentage: number;
  color: string;
  description: string;
}

export interface Wisdom {
  quote: string;
  author: string;
  actionItem: string;
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}