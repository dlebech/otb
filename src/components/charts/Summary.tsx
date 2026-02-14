import React from 'react';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { formatNumber } from '../../util';
import AmountCard from './AmountCard';
import { Transaction, Account } from '../../types/redux';
import { type CategoryExpense, type NestEntry } from '../../types/app';

interface SummaryProps {
  expenses: Transaction[];
  income: Transaction[];
  sortedCategoryExpenses: CategoryExpense[];
  accounts: { [key: string]: Account };
}

const groupAmounts = (transactions: Transaction[], accounts: { [key: string]: Account }) => {
  return (nest<Transaction>()
    .key((t: Transaction) => t.account || '')
    // @ts-expect-error d3-collection types: .key() this-return doesn't track .rollup() generic
    .rollup((t: Transaction[]) => ({
      amount: sum(t, d => d.amount),
      originalAmount: sum(t, d => (d as unknown as Record<string, number>).originalAmount || 0)
    }))
    .entries(transactions) as unknown as NestEntry<{ amount: number; originalAmount: number }>[])
    .map((e) => ({ account: accounts[e.key], amounts: e.value }));
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
    <div className="flex flex-wrap gap-6 my-4">
      <div className="flex-1">
        <AmountCard title="Expenses" amount={expenseTotal} amounts={expenseAmounts} />
      </div>
      <div className="flex-1">
        <AmountCard title="Income" amount={incomeTotal} amounts={incomeAmounts} />
      </div>
      {categorySpend && <div className="flex-1">
        <AmountCard {...categorySpend} />
      </div>}
    </div>
  );
}
