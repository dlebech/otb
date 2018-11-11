import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color'
import { formatNumber } from '../../util';

const gradientOffset = values => {
  const dataMax = Math.max(...values);
  const dataMin = Math.min(...values);

  if (dataMax <= 0){
  	return 0
  }
  else if (dataMin >= 0){
  	return 1
  }
  else{
  	return dataMax / (dataMax - dataMin);
  }
}

const AmountSumArea = props => {
  const data = nest()
    .key(d => d.date)
    .sortKeys(ascending)
    .rollup(a => sum(a, d => d.amount))
    .entries(props.transactions);

  const off = gradientOffset(data.map(d => d.value));
  const id = `split-${Math.random()}`;

  return (
    <div className="chart">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor={color.bootstrap.success} stopOpacity={1}/>
              <stop offset={off} stopColor={color.bootstrap.danger} stopOpacity={1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={v => formatNumber(v, { maximumFractionDigits: 0 })} />
          <Area
            type="monotone"
            dataKey="value"
            fill={`url(#${id})`}
            stroke={`url(#${id})`}
            activeDot={{
              stroke: color.bootstrap.light,
              fill: color.bootstrap.dark
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

AmountSumArea.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired
};

export default AmountSumArea;