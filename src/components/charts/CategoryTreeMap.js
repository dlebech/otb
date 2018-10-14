import React from 'react';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
} from 'recharts';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import color from '../../data/color'
import { findCategory, formatNumber } from '../../util';

const CategoryTreeMap = props => {
  const expenses = props.transactions.filter(t => t.amount < 0);

  const data = nest()
    .key(d => d.category.confirmed || 'n/a')
    .rollup(a => Math.abs(sum(a, d => d.amount)))
    .entries(expenses)
    .sort((a, b) => b.value - a.value)
    .map(d => {
      return {
        key: findCategory(props.categories, d.key).name,
        value: d.value
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
            formatter={val => formatNumber(val, { maximumFractionDigits: 0 })}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
};

export default CategoryTreeMap;