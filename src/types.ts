export type TransactionType = "INCOME" | "EXPENSE";

export interface Summary {
  from: string;
  to: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
}

export interface AccountBalance {
  accountId: string;
  name: string;
  type: string;
  balance: number;
}

export interface Balances {
  total: number;
  accounts: AccountBalance[];
}

export interface CategoryTotal {
  categoryId: string | null;
  category: string;
  total: number;
  percentage: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  transactionDate: string;
}

export type AccountType = "CHECKING" | "WALLET" | "CREDIT_CARD" | "INVESTIMENT";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}