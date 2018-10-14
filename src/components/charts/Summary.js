import React from 'react';
import PropTypes from 'prop-types';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { uncategorized } from '../../data/categories';
import { findCategory, formatNumber } from '../../util';
import AmountCard from './AmountCard';

const groupAmounts = (transactions, accounts) => {
  return nest()
    .key(t => t.account)
    .rollup(t => ({
      amount: sum(t, d => d.amount),
      originalAmount: sum(t, d => d.originalAmount)
    }))
    .entries(transactions)
    .map(e => ({ account: accounts.find(a => a.id === e.key), amounts: e.value }));
};

const Summary = props => {
  const expenses = props.transactions.filter(d => d.amount < 0);
  const incomes = props.transactions.filter(d => d.amount >= 0);

  const expenseTotal = formatNumber(Math.round(Math.abs(sum(expenses, d => d.amount))));
  const expenseAmounts = groupAmounts(expenses, props.accounts);
  const incomeTotal = formatNumber(Math.round(sum(incomes, d => d.amount)));
  const incomeAmounts = groupAmounts(incomes, props.accounts);

  const largestCategory = nest()
    .key(d => d.category.confirmed || uncategorized.id)
    .rollup(t => ({ amount: sum(t, d => d.amount), transactions: t }))
    .entries(expenses)
    .sort((a, b) => a.value.amount - b.value.amount)[0];

  let categorySpend;
  if (largestCategory) {
    const category = findCategory(props.categories, largestCategory.key);
    categorySpend = {
      title: `Spent on "${category.name}"`,
      amount: formatNumber(Math.round(Math.abs(largestCategory.value.amount))),
      amounts: groupAmounts(largestCategory.value.transactions, props.accounts)
    };
  }

  return (
    <div className="row my-3">
      <div className="col">
        <AmountCard title="Expenses" amount={expenseTotal} amounts={expenseAmounts} />
      </div>
      <div className="col">
        <AmountCard title="Income" amount={incomeTotal} amounts={incomeAmounts} />
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
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  })).isRequired,
  baseCurrency: PropTypes.string.isRequired
};

export default Summary;
