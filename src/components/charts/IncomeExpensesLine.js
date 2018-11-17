import React from 'react';
import PropTypes from 'prop-types';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color'
import CustomLineChart from '../shared/CustomLineChart';

const IncomeExpensesLine = props => {
  const keySelector = props.endDate.diff(props.startDate, 'month', true) < 2 ?
    d => d.date :
    d => d.date.substring(0, 7)
  const data = nest()
    .key(keySelector)
    .sortKeys(ascending)
    .rollup(a => {
      return {
        expenses: Math.abs(sum(a, d => (d.amount < 0 ? d.amount : 0))),
        income: sum(a, d => (d.amount >= 0 ? d.amount : 0))
      }
    })
    .entries(props.transactions);

  data.forEach(d => {
    d.expenses = d.value.expenses;
    d.income = d.value.income;
    delete d.value;
  });

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
      data={data}
      series={series}
    />
  );
};

IncomeExpensesLine.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired
};

export default IncomeExpensesLine;