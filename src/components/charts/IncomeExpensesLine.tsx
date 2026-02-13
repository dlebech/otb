import React from 'react';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color';
import CustomLineChart from '../shared/CustomLineChart';
import { Moment } from 'moment';
import { Transaction } from '../../types/redux';

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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (nest() as any)
    .key(keySelector)
    .sortKeys(ascending)
    .rollup((a: Transaction[]) => {
      return {
        expenses: Math.abs(sum(a, d => (d.amount < 0 ? d.amount : 0))),
        income: sum(a, d => (d.amount >= 0 ? d.amount : 0))
      }
    })
    .entries(transactions);

  const processedData: ProcessedData[] = data.map((d: { key: string; value: { expenses: number; income: number } }) => ({
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
