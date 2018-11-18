import React from 'react';
import PropTypes from 'prop-types';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { formatNumber } from '../../util';
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
  const expenses = props.expenses;
  const income = props.income;

  const expenseTotal = formatNumber(Math.round(Math.abs(sum(expenses, d => d.amount))));
  const expenseAmounts = groupAmounts(expenses, props.accounts);
  const incomeTotal = formatNumber(Math.round(sum(income, d => d.amount)));
  const incomeAmounts = groupAmounts(income, props.accounts);

  const largestCategoryExpenses = props.sortedCategoryExpenses[0];

  let categorySpend;
  if (largestCategoryExpenses) {
    const category = largestCategoryExpenses.value.category;
    categorySpend = {
      title: `Spent on "${category.name}"`,
      amount: formatNumber(Math.round(largestCategoryExpenses.value.amount)),
      amounts: groupAmounts(largestCategoryExpenses.value.transactions, props.accounts)
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
  expenses: PropTypes.arrayOf(PropTypes.shape({
    amount: PropTypes.number.isRequired,
    category: PropTypes.shape({
      confirmed: PropTypes.string
    }).isRequired
  })).isRequired,
  income: PropTypes.arrayOf(PropTypes.shape({
    amount: PropTypes.number.isRequired,
    category: PropTypes.shape({
      confirmed: PropTypes.string
    }).isRequired
  })).isRequired,
  sortedCategoryExpenses: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.shape({
      amount: PropTypes.number.isRequired,
      transactions: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number.isRequired,
        category: PropTypes.shape({
          confirmed: PropTypes.string
        }).isRequired
      })).isRequired,
      category: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
      }).isRequired
    })
  })).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  })).isRequired,
  baseCurrency: PropTypes.string.isRequired
};

export default Summary;
