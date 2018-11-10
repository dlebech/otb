import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color'
import { formatNumber } from '../../util';

const AmountSumLine = props => {
  const data = nest()
    .key(d => d.date)
    .sortKeys(ascending)
    .rollup(a => sum(a, d => d.amount))
    .entries(props.transactions);

  return (
    <div className="chart">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={v => formatNumber(v, { maximumFractionDigits: 2 })} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color.bootstrap.dark}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

AmountSumLine.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired
};

export default AmountSumLine;