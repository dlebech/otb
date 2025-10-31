import React from 'react';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { formatNumber } from '../../util';
import AmountCard from './AmountCard';
import { Transaction, Account, Category } from '../../types/redux';

interface TransactionWithAmount extends Transaction {
  originalAmount: number;
}

interface CategoryExpense {
  key: string;
  value: {
    amount: number;
    transactions: TransactionWithAmount[];
    category: Category;
  };
}

interface SummaryProps {
  expenses: TransactionWithAmount[];
  income: TransactionWithAmount[];
  sortedCategoryExpenses: CategoryExpense[];
  accounts: { [key: string]: Account };
}

const groupAmounts = (transactions: TransactionWithAmount[], accounts: { [key: string]: Account }) => {
  return (nest<TransactionWithAmount>() as any)
    .key((t: TransactionWithAmount) => t.account || '')
    .rollup((t: TransactionWithAmount[]) => ({
      amount: sum(t, d => d.amount),
      originalAmount: sum(t, d => d.originalAmount)
    }))
    .entries(transactions)
    .map((e: any) => ({ account: accounts[e.key], amounts: e.value }));
};

export default function Summary({ expenses, income, sortedCategoryExpenses, accounts }: SummaryProps) {
  const expenseTotal = formatNumber(Math.round(Math.abs(sum(expenses, d => d.amount))));
  const expenseAmounts = groupAmounts(expenses, accounts);
  const incomeTotal = formatNumber(Math.round(sum(income, d => d.amount)));
  const incomeAmounts = groupAmounts(income, accounts);

  const largestCategoryExpense = sortedCategoryExpenses[0];

  let categorySpend;
  if (largestCategoryExpense) {
    const category = largestCategoryExpense.value.category;
    categorySpend = {
      title: `Spent on "${category.name}"`,
      amount: formatNumber(Math.round(largestCategoryExpense.value.amount)),
      amounts: groupAmounts(largestCategoryExpense.value.transactions, accounts)
    };
  }

  return (
    <div className="row my-3">
      <div className="col">
        <AmountCard title="Expenses" amount={expenseTotal} amounts={expenseAmounts} />
      </div>
      <div className="col">
        <AmountCard title="Income" amount={incomeTotal} amounts={incomeAmounts} />
      </div>
      {categorySpend && <div className="col">
        <AmountCard {...categorySpend} />
      </div>}
    </div>
  );
}
