// Central location for all application types and interfaces
import { type Account } from '../data/accounts';
import { type Category } from '../data/categories';

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
  data: any[][];
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
  dateSelect: Record<string, any>;
  transactionList: TransactionListState;
  charts: ChartsState;
  currencies?: string[];
  currencyRates?: any;
}