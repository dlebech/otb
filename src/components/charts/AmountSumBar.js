import React from 'react';
import PropTypes from 'prop-types';
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
import color from '../../data/color'
import { formatNumber } from '../../util';

const AmountSumBar = props => {
  const data = nest()
    .key(d => d.date.substring(0, 7))
    .sortKeys(ascending)
    .rollup(a => sum(a, d => d.amount))
    .entries(props.transactions);

  return (
    <div className="chart">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={v => formatNumber(v, { maximumFractionDigits: 0 })} />
          <Bar
            type="monotone"
            dataKey="value"
            name="Sum"
          >
            {data.map(d => {
              const chosenColor = d.value < 0 ? color.bootstrap.danger : color.bootstrap.success;
              return <Cell
                key={`amount-sum-bar-cell-${d.date}`}
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
};

AmountSumBar.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired
};

export default AmountSumBar;