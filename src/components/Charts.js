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
import Summary from './charts/Summary';

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

const Charts = props => {
  if (props.transactions.length === 0) return <NoData />;

  const filteredTransactions = props.transactions.filter(t => {
    return !t.ignore &&
      moment(t.date).isBetween(props.startDate, props.endDate, 'day', '[]');
  });

  const currencies = props.accounts
    .filter(a => !!a.currency)
    .map(a => a.currency);

  return (
    <React.Fragment>
      <div className="row align-items-center">
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
        {currencies.length > 1 && <div className="col-auto">
          <div className="form-row align-items-center">
            <div className="col-auto">
              <label className="my-0" htmlFor="base-currency">Base Currency</label>
            </div>
            <div className="col">
              <select
                id="base-currency"
                className="form-control"
                value={props.baseCurrency}
                onChange={e => props.handleBaseCurrencyChange(e.target.value)}
              >
                {currencies.map(c => {
                  return <option key={`base-currency-${c}`} value={c}>{c}</option>
                })}
              </select>
            </div>
          </div>
        </div>}
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

  const baseCurrency = state.edit.charts.baseCurrency ||
    (state.accounts.data.find(a => !!a.currency) || {}).currency ||
    null;

  return {
    dateSelectId,
    baseCurrency,
    transactions: state.transactions.data,
    categories: state.categories.data,
    accounts: state.accounts.data,
    startDate: dateSelect.startDate,
    endDate: dateSelect.endDate
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleDatesChange: (dateSelectId, startDate, endDate) => {
      dispatch(actions.editDates(dateSelectId, startDate, endDate));
    },
    handleBaseCurrencyChange: baseCurrency => {
      dispatch(actions.setChartsBaseCurrency(baseCurrency));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Charts);