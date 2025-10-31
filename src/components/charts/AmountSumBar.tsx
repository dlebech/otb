import React from 'react';
import {
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color';
import { formatNumber } from '../../util';
import { Transaction } from '../../types/redux';

interface Props {
  transactions: Transaction[];
}

export default function AmountSumBar({ transactions }: Props) {
  const data = nest<Transaction>()
    .key((d: Transaction) => d.date.substring(0, 7))
    .sortKeys(ascending)
    .rollup((a: Transaction[]) => sum(a, (d: Transaction) => d.amount) as any)
    .entries(transactions);

  return (
    <div className="chart">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={(v: number) => formatNumber(v, {})} />
          <Bar
            type="monotone"
            dataKey="value"
            name="Sum"
          >
            {data.map(d => {
              const chosenColor = (d.value || 0) < 0 ? color.bootstrap.danger : color.bootstrap.success;
              return <Cell
                key={`amount-sum-bar-cell-${d.key}`}
                fill={chosenColor}
                stroke={chosenColor}
              />
            })}
          </Bar>
          <ReferenceLine
            y={0}
            stroke={color.bootstrap.light}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
