import React from 'react';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Moment } from 'moment';
import CustomLineChart from '../shared/CustomLineChart';
import { Transaction } from '../../types/redux';
import { type CategoryExpense } from '../../types/app';

interface Props {
  sortedCategoryExpenses: CategoryExpense[];
  startDate: Moment;
  endDate: Moment;
}

export default function CategoryLine({ sortedCategoryExpenses, startDate, endDate }: Props) {
  const largestCategories = [...sortedCategoryExpenses];

  const dateKeySelector = endDate.diff(startDate, 'month', true) < 2 ?
    (t: Transaction) => t.date :
    (t: Transaction) => t.date.substring(0, 7)

  // Find all dates from the top categories
  // Make a category -> date -> amount mapping from the categories
  const obj: Record<string, Record<string, number>> = {};
  largestCategories.forEach(c => {
    c.value.transactions.forEach(t => {
      const date = dateKeySelector(t);
      const categoryId = c.value.category.id
      // defaultdict would be nice here :-)
      if (!obj[date]) obj[date] = {};
      if (!obj[date][categoryId]) obj[date][categoryId] = 0;
      obj[date][categoryId] += Math.abs(t.amount);
    });
  });

  // Transform the mapping into a flat format that recharts understands.
  const allCategories = new Set(largestCategories.map(c => c.value.category.id));
  const data = Object.entries(obj)
    .map(([date, categories]) => {
      const categoryIds = new Set(Object.keys(categories));

      // Add 0 amounts for dates that are missing a specific category ID.
      // This avoids holes in the graph.
      const missingCategories = [...allCategories]
        .filter(c => !categoryIds.has(c))
        .reduce((o, c) => {
          o[c] = 0;
          return o;
        }, {} as Record<string, number>);

      return {
        key: date,
        ...categories,
        ...missingCategories
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const series = largestCategories
    .map((c, i) => {
      return {
        dataKey: c.value.category.id,
        name: c.value.category.name,
        fill: schemeCategory10[i],
        stroke: schemeCategory10[i]
      }
    });

  const categoryIdKeys = series.map(s => s.dataKey).join();

  return (
    <CustomLineChart
      key={categoryIdKeys} // This recreates the component when categories change
      data={data}
      series={series}
      showLegend={true}
    />
  );
}
