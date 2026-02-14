// Central location for all application types and interfaces
import { type Account } from '../data/accounts';
import { type Category } from '../data/categories';
import { type Moment } from 'moment';

// Re-export imported types for convenience
export { type Account, type Category };

// Transaction-related types
export interface CategoryInfo {
  id: string;
  name: string;
}

export interface TransactionCategory {
  guess?: string;
  confirmed?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  descriptionCleaned: string;
  amount: number;
  total: number;
  account?: string;
  category: TransactionCategory;
  ignore?: boolean;
  // These properties are added when transactions are processed for display
  categoryGuess?: CategoryInfo | null;
  categoryConfirmed?: CategoryInfo | null;
}

export interface ColumnSpec {
  type: string;
}

export interface TransactionImport {
  data: (string | number)[][];
  skipRows: number;
  skipDuplicates: boolean;
  columnSpec: ColumnSpec[];
  dateFormat: string;
  account?: string;
}

export interface TransactionGroup {
  primaryId: string;
  linkedIds: string[];
}

export interface TransactionsState {
  version: number;
  import: TransactionImport;
  data: Transaction[];
  categorizer: {
    bayes: string;
  };
  groups?: { [key: string]: TransactionGroup };
}

// Account-related types
export interface AccountsState {
  data: Account[];
}

// Categories-related types
export interface CategoriesState {
  data: Category[];
}

// App state types
export interface AppState {
  storage: {
    localStorage: boolean;
  };
  isTestMode?: boolean;
}

// Edit state types
export interface TransactionListState {
  page: number;
  pageSize: number;
  sortKey: string;
  sortAscending: boolean;
  filterCategories: Set<string>;
  roundAmount?: boolean;
}

export interface ChartsState {
  baseCurrency?: string;
  filterCategories?: Set<string>;
  groupByParentCategory?: boolean;
}

export interface EditState {
  isCategoryGuessing: boolean;
  isParsing: boolean;
  isFetchingCurrencies: boolean;
  isFetchingCurrencyRates: boolean;
  dateSelect: Record<string, { startDate: string | null; endDate: string | null }>;
  transactionList: TransactionListState;
  charts: ChartsState;
  currencies?: string[];
  currencyRates?: Record<string, Record<string, number>>;
}

// Shared UI types used across multiple components

// D3 nest entry helper type for typed nest operations
export interface NestEntry<T> {
  key: string;
  value: T;
}

// Category option for react-select dropdowns (used in CategorySelect, CategoryExpenses, RowCategorizer, BulkActionSelection)
export interface CategoryOption {
  label: string;
  value: string;
}

// Category expense data used across chart components (Charts, Summary, CategoryExpenses, CategoryLine, CategoryTreeMap)
export interface CategoryExpense {
  key: string;
  value: {
    amount: number;
    transactions: Transaction[];
    category: Category;
  };
}

// Enriched transaction for display (with resolved categories and Moment date)
export interface DisplayTransaction extends Omit<Transaction, 'date' | 'categoryGuess' | 'categoryConfirmed'> {
  date: Moment;
  categoryGuess: Category | null;
  categoryConfirmed: Category | null;
}

// Linked transaction summary for display in grouped transaction tooltips
export interface LinkedTransaction {
  id: string;
  date: Moment;
  description: string;
}

// Transaction group with resolved linked transactions for display
export interface DisplayTransactionGroup {
  groupId: string;
  linkedTransactions: LinkedTransaction[];
}