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

const IncomeExpensesLine = props => {
  const data = nest()
    .key(d => d.date)
    .sortKeys(ascending)
    .rollup(a => {
      return {
        expenses: sum(a, d => (d.amount < 0 ? d.amount : 0)),
        income: sum(a, d => (d.amount >= 0 ? d.amount : 0))
      }
    })
    .entries(props.transactions);

  data.forEach(d => {
    d.Expenses = d.value.expenses;
    d.Income = d.value.income;
    delete d.value;
  });

  return (
    <div className="chart">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip formatter={v => formatNumber(v, { maximumFractionDigits: 0 })} />
          <Line
            type="monotone"
            dataKey="Expenses"
            fill={color.bootstrap.danger}
            stroke={color.bootstrap.danger}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Income"
            fill={color.bootstrap.success}
            stroke={color.bootstrap.success}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

IncomeExpensesLine.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired
};

export default IncomeExpensesLine;