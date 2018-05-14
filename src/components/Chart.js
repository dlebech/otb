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
import NoData from './NoData';
import color from '../data/color'

const AmountCard = props => {
  return (
    <div className="card">
      <div className="card-body">
        <p className="display-3">{props.value}</p>
        <h5 className="card-title">{props.title}</h5>
      </div>
    </div>
  )
};

const findCategory = (categories, categoryId, returnFallback = true) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category && returnFallback) return { name: 'Uncategorized' };
  return category;
};

const Summary = props => {
  const expenses = props.transactions.filter(d => d.amount < 0);
  const incomes = props.transactions.filter(d => d.amount >= 0);

  const expenseTotal = Math.round(Math.abs(sum(expenses, d => d.amount)))
    .toLocaleString();

  const incomeTotal = Math.round(sum(incomes, d => d.amount))
    .toLocaleString();

  const largestCategory = nest()
    .key(d => d.category.confirmed || 'n/a')
    .rollup(a => sum(a, d => d.amount))
    .entries(expenses)
    .sort((a, b) => a.value - b.value)[0];

  let categorySpend;
  if (largestCategory) {
    const category = findCategory(props.categories, largestCategory.key);
    categorySpend = {
      title: `Spent on "${category.name}"`,
      value: Math.round(Math.abs(largestCategory.value)).toLocaleString()
    };
  }

  return (
    <React.Fragment>
      <div className="row mb-3">
        <div className="col">
          <AmountCard title="Expenses" value={expenseTotal} />
        </div>
        <div className="col">
          <AmountCard title="Income" value={incomeTotal} />
        </div>
        {categorySpend && <div className="col">
          <AmountCard {...categorySpend} />
        </div>}
      </div>
    </React.Fragment>
  );
};

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

  return (
    <React.Fragment>
      <Summary
        transactions={props.transactions}
        categories={props.categories}
      />
      <div className="row">
        <div className="col">
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-6">
          <h3 className="text-center">Sum of Transactions over time</h3>
          <AmountPerDay transactions={props.transactions} />
        </div>
        <div className="col-6">
          <h3 className="text-center">Categories where money is spent</h3>
          <AmountPerCategory
            transactions={props.transactions}
            categories={props.categories}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    transactions: state.transactions.data,
    categories: state.categories.data
  };
};

export default connect(mapStateToProps)(Chart);