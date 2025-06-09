import React from 'react';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color';
import CustomLineChart from '../shared/CustomLineChart';

interface Transaction {
  date: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  startDate: any; // moment object
  endDate: any; // moment object
}

interface ProcessedData {
  key: string;
  expenses: number;
  income: number;
}

export default function IncomeExpensesLine({ transactions, startDate, endDate }: Props) {
  const keySelector = endDate.diff(startDate, 'month', true) < 2 ?
    (d: Transaction) => d.date :
    (d: Transaction) => d.date.substring(0, 7)
  
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

  const processedData: ProcessedData[] = data.map((d: any) => ({
    key: d.key,
    expenses: d.value.expenses,
    income: d.value.income
  }));

  const series = [
    {
      name: 'Expenses',
      dataKey: 'expenses',
      fill: color.bootstrap.danger,
      stroke: color.bootstrap.danger
    },
    {
      name: 'Income',
      dataKey: 'income',
      fill: color.bootstrap.success,
      stroke: color.bootstrap.success
    }
  ];

  return (
    <CustomLineChart
      data={processedData}
      series={series}
    />
  );
}
