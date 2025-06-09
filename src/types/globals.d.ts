declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// Transaction and Category Types
interface Transaction {
  id: string;
  date: string;
  description: string;
  descriptionCleaned: string;
  amount: number;
  total: number;
  category: {
    confirmed?: string;
    guess?: string;
  };
  account: string;
  currency?: string;
  originalAmount?: number;
  originalCurrency?: string;
  ignore?: boolean;
}

interface TransactionWithAmount extends Transaction {
  amount: number;
  originalAmount?: number;
}

interface Category {
  id: string;
  name: string;
  parent?: string;
  transactionCount?: number;
}

interface CategoryExpense {
  key: string;
  value: {
    amount: number;
    transactions: TransactionWithAmount[];
    category: Category;
  };
}

// Global Redux State Types
interface RootState {
  app: {
    storage: {
      localStorage: boolean;
    };
    isTestMode: boolean;
  };
  transactions: {
    data: any[];
  };
  accounts: {
    data: any[];
  };
  categories: {
    data: any[];
  };
  modal: any;
  edit: any;
  search: any;
}

// React Select module declaration
declare module 'react-select' {
  import { Component } from 'react';
  
  export interface Option {
    value: any;
    label: string;
  }

  export interface SelectProps<T = Option> {
    value?: T | T[] | null;
    options: T[];
    onChange?: (value: T | T[] | null) => void;
    isMulti?: boolean;
    placeholder?: string;
    className?: string;
    isSearchable?: boolean;
    isClearable?: boolean;
    name?: string;
  }

  export default class Select<T = Option> extends Component<SelectProps<T>> {}
}
