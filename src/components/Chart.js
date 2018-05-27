import React from 'react';
import { connect } from 'react-redux';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Treemap,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import moment from 'moment';
import color from '../data/color'
import * as actions from '../actions';
import { findCategory } from '../util';
import NoData from './NoData';
import Dates from './Dates';
import Summary from './chart/Summary';

const AmountPerDay = props => {
  const data = nest()
    .key(d => d.date)
    .rollup(a => sum(a, d => d.amount))
    .entries(props.transactions)
    .sort((a, b) => a.key.localeCompare(b.key))

  return (
    <div className="chart">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip />
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

const AmountPerCategory = props => {
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
            formatter={val => Math.round(val).toLocaleString()}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
};

const Chart = props => {
  if (props.transactions.length === 0) return <NoData />;

  const filteredTransactions = props.transactions.filter(t => {
    return !t.ignore &&
      moment(t.date).isBetween(props.startDate, props.endDate, 'day', '[]');
  });

  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <Dates
            id={props.dateSelectId}
            startDate={props.startDate}
            endDate={props.endDate}
            handleDatesChange={({startDate, endDate}) => {
              props.handleDatesChange(props.dateSelectId, startDate, endDate);
            }}
          />
        </div>
      </div>
      <Summary
        transactions={filteredTransactions}
        categories={props.categories}
      />
      <div className="row justify-content-center">
        <div className="col-6">
          <h3 className="text-center">Sum of Transactions over time</h3>
          <AmountPerDay transactions={filteredTransactions} />
        </div>
        <div className="col-6">
          <h3 className="text-center">Categories where money is spent</h3>
          <AmountPerCategory
            transactions={filteredTransactions}
            categories={props.categories}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  const dateSelectId = 'chart-dates';
  const dateSelect = state.edit.dateSelect[dateSelectId] || {
    startDate: moment().startOf('month'),
    endDate: moment()
  };

  return {
    dateSelectId,
    transactions: state.transactions.data,
    categories: state.categories.data,
    startDate: dateSelect.startDate,
    endDate: dateSelect.endDate
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleDatesChange: (dateSelectId, startDate, endDate) => {
      return dispatch(actions.editDates(dateSelectId, startDate, endDate));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);