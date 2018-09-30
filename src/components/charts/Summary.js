import React from 'react';
import PropTypes from 'prop-types';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { findCategory } from '../../util';
import AmountCard from './AmountCard';

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
    <div className="row my-3">
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
  );
};

Summary.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    amount: PropTypes.number.isRequired,
    category: PropTypes.shape({
      confirmed: PropTypes.string
    }).isRequired
  })).isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({

  }))
};

export default Summary;
