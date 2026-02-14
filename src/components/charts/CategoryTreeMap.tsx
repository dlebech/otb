import React from 'react';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
} from 'recharts';
import color from '../../data/color';
import { formatNumber } from '../../util';
import { type CategoryExpense } from '../../types/app';

interface Props {
  sortedCategoryExpenses: CategoryExpense[];
}

export default function CategoryTreeMap({ sortedCategoryExpenses }: Props) {
  const data = sortedCategoryExpenses
    .map(d => {
      return {
        key: d.value.category.name,
        value: d.value.amount
      };
    });

  return (
    <div className="chart">
      <ResponsiveContainer>
        <Treemap
          data={data}
          nameKey="key"
          dataKey="value"
          stroke={color.theme.white}
          fill={color.theme.dark}
        >
          <Tooltip
            formatter={(val: number | undefined) => formatNumber(val ?? 0, {})}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
