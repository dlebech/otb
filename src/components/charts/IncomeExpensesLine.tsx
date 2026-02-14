import React from 'react';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color';
import CustomLineChart from '../shared/CustomLineChart';
import { Moment } from 'moment';
import { Transaction } from '../../types/redux';
import { type NestEntry } from '../../types/app';

interface Props {
  transactions: Transaction[];
  startDate: Moment;
  endDate: Moment;
}

interface ProcessedData {
  key: string;
  expenses: number;
  income: number;
  [key: string]: string | number;
}

export default function IncomeExpensesLine({ transactions, startDate, endDate }: Props) {
  const keySelector = endDate.diff(startDate, 'month', true) < 2 ?
    (d: Transaction) => d.date :
    (d: Transaction) => d.date.substring(0, 7)

  const data = nest<Transaction>()
    .key(keySelector)
    .sortKeys(ascending)
    // @ts-expect-error d3-collection types: .key() this-return doesn't track .rollup() generic
    .rollup((a: Transaction[]) => {
      return {
        expenses: Math.abs(sum(a, d => (d.amount < 0 ? d.amount : 0))),
        income: sum(a, d => (d.amount >= 0 ? d.amount : 0))
      }
    })
    .entries(transactions) as unknown as NestEntry<{ expenses: number; income: number }>[];

  const processedData: ProcessedData[] = data.map((d) => ({
    key: d.key,
    expenses: d.value.expenses,
    income: d.value.income
  }));

  const series = [
    {
      name: 'Expenses',
      dataKey: 'expenses',
      fill: color.theme.danger,
      stroke: color.theme.danger
    },
    {
      name: 'Income',
      dataKey: 'income',
      fill: color.theme.success,
      stroke: color.theme.success
    }
  ];

  return (
    <CustomLineChart
      data={processedData}
      series={series}
    />
  );
}
