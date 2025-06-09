import React from 'react';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
} from 'recharts';
import color from '../../data/color';
import { formatNumber } from '../../util';

interface Category {
  id: string;
  name: string;
}

interface CategoryExpense {
  value: {
    amount: number;
    category: Category;
  };
}

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
          stroke={color.bootstrap.white}
          fill={color.bootstrap.dark}
        >
          <Tooltip
            formatter={(val: number) => formatNumber(val, {})}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
