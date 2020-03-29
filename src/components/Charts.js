import React from 'react';
import { connect } from 'react-redux';
import loadable from '@loadable/component';
import moment from 'moment';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { createSelector } from 'reselect';
import { uncategorized } from '../data/categories';
import * as actions from '../actions';
import { convertCurrency, findCategory } from '../util';
import NoData from './NoData';
import Dates from './Dates';
import Summary from './charts/Summary';
import AmountSumBar from './charts/AmountSumBar';
import IncomeExpensesLine from './charts/IncomeExpensesLine';
import Loading from './shared/Loading';

const CategoryExpenses = loadable(() => import('./charts/CategoryExpenses'), {
  fallback: <Loading />
});

const Charts = props => {
  if (props.noData) return <NoData />;

  if (!props.currencyRates && props.currencies.length > 1) {
    props.ensureCurrencyRates(props.currencies);
    return <Loading />;
  }

  return (
    <>
      <div className="row align-items-center">
        <div className="col">
          <Dates
            id={props.dateSelectId}
            startDate={props.startDate}
            endDate={props.endDate}
            handleDatesChange={props.handleDatesChange}
          />
        </div>
        <div className="col-md-auto">
          {props.currencies.length > 1 && <div className="form-row align-items-center">
            <div className="col-auto">
              <label className="my-0" htmlFor="base-currency">Base currency</label>
            </div>
            <div className="col">
              <select
                id="base-currency"
                className="form-control"
                value={props.baseCurrency}
                onChange={e => props.handleBaseCurrencyChange(e.target.value)}
              >
                {props.currencies.map(c => {
                  return <option key={`base-currency-${c}`} value={c}>{c}</option>
                })}
              </select>
            </div>
          </div>}
        </div>
        <div className="col-md-auto">
          <div className="form-row align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                id="group-by-parent-categories"
                className="form-check-input"
                checked={props.groupByParentCategory}
                onChange={e => props.handleGroupByParentCategoryChange(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="group-by-parent-categories">
                Show only parent categories
              </label>
            </div>
          </div>
        </div>
      </div>
      <section>
        <Summary
          expenses={props.expenses}
          income={props.income}
          sortedCategoryExpenses={props.sortedCategoryExpenses}
          accounts={props.accounts}
          baseCurrency={props.baseCurrency}
        />
      </section>
      <section className="mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <h4 className="text-center">Income and expenses over time</h4>
            <IncomeExpensesLine
              transactions={props.transactions}
              startDate={props.startDate}
              endDate={props.endDate}
            />
          </div>
          <div className="col-lg-6">
            <h4 className="text-center">Sum of income and expenses over time</h4>
            <AmountSumBar
              transactions={props.transactions}
            />
          </div>
        </div>
      </section>
      <section className="mt-5">
        <CategoryExpenses
          filterCategories={props.filterCategories}
          categories={props.categories}
          handleCategoryChange={props.handleCategoryChange}
          handleCategorySortingChange={props.handleCategorySortingChange}
          sortedCategoryExpenses={props.sortedCategoryExpenses}
          startDate={props.startDate}
          endDate={props.endDate}
        />
      </section>
    </>
  );
};

// The following functions are used to avoid doing expensive filtering multiple times.
const dateSelectId = 'chart-dates';
const _getDateSelects = state => state.edit.dateSelect;
const _getAccounts = state => state.accounts.data;
const _getCategories = state => state.categories.data;
const _getBaseCurrency = state => state.edit.charts.baseCurrency;
const _getTransactions = state => state.transactions.data;
const _getTransactionGroups = state => state.transactions.groups;
const _getCurrencyRates = state => state.edit.currencyRates;
const getGroupByParentCategory = state => state.edit.charts.groupByParentCategory;

const getDateSelect = createSelector([_getDateSelects], dateSelects => {
  return dateSelects[dateSelectId] || {
    startDate: moment().subtract(3, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  };
});

const getBaseCurrency = createSelector(
  [_getAccounts, _getBaseCurrency],
  (accounts, baseCurrency) => {
    // If not explicitly set, the base currency is just the currency of the first
    // account (usually the default)
    return baseCurrency || (accounts.find(a => !!a.currency) || {}).currency || null;
  }
);

const getCurrencies = createSelector([_getAccounts], accounts => {
  return Array.from(
    new Set(accounts.filter(a => !!a.currency).map(a => a.currency))
  ).sort()
});

const getAccounts = createSelector([_getAccounts], accounts => {
  return accounts.reduce((obj, acct) => {
    obj[acct.id] = acct;
    return obj;
  }, {});
});

const getCategories = createSelector([_getCategories], categories => {
  return categories.reduce((obj, category) => {
    obj[category.id] = category;
    return obj;
  }, {})
});

const _getTransactionsWithGrouping = createSelector(
  [_getTransactions,_getTransactionGroups],
  (transactions,transactionGroups) => {
    if (!transactionGroups) return transactions;

    // Copy the array because we will manipulate it below...
    transactions = [...transactions];

    // Create a reverse index lookup table for easier transaction access.
    const reverseLookup = transactions.reduce((obj, cur, i) => {
      obj[cur.id] = i;
      return obj;
    }, {})

    const transactionsToRemove = new Set();

    // For each of the groups:
    // 1. Find the primary transaction
    // 2. Calculate a new amount for the primary transaction
    // 3. Replace the existing transaction and remove linked transactions
    // XXX: In the future, this summing of amounts might be changed by a group
    // parameter. This is just the default behavior for now and it should work
    // well for e.g. refunds
    Object.entries(transactionGroups)
      .forEach(([_, group]) => {
        const primaryTransactionIndex = reverseLookup[group.primaryId];
        const primaryTransaction = transactions[primaryTransactionIndex];

        const linkedTransactionAmounts = group.linkedIds.map(id => {
          transactionsToRemove.add(id); // Yay side effects :-)
          return transactions[reverseLookup[id]].amount;
        });

        const newTransaction = Object.assign({}, primaryTransaction, {
          // TODO: Handle different currencies?
          amount: sum([primaryTransaction.amount, ...linkedTransactionAmounts])
        });

        transactions.splice(primaryTransactionIndex, 1, newTransaction);
      });

    transactions = transactions.filter(t => !transactionsToRemove.has(t.id));
    return transactions;
  }
);
const getTransactions = createSelector(
  [
    _getTransactionsWithGrouping,
    getDateSelect,
    getAccounts,
    getCategories,
    getCurrencies,
    _getCurrencyRates,
    getBaseCurrency,
    getGroupByParentCategory
  ],
  (
    transactions,
    dateSelect,
    accounts,
    categories,
    currencies,
    currencyRates,
    baseCurrency,
    groupByParentCategory
  ) => {
    transactions = transactions.filter(t => {
      return !t.ignore &&
        moment(t.date).isBetween(dateSelect.startDate, dateSelect.endDate, 'day', '[]');
    });

    transactions = transactions.map(t => {
      let newTransaction = Object.assign({}, t, {
        category: findCategory(
          categories,
          t.category.confirmed || uncategorized.id,
          true,
          !!groupByParentCategory
        )
      });

      if (currencies.length > 1 && currencyRates) {
        newTransaction  = Object.assign({}, newTransaction, {
          amount: convertCurrency(
            t.amount,
            accounts[t.account].currency,
            baseCurrency,
            t.date,
            currencyRates
          ),
          currency: baseCurrency,
          originalAmount: t.amount,
          originalCurrency: accounts[t.account].currency
        });
      }

      return newTransaction;
    });

    return transactions;
  }
);

const getIncomeAndExpenses = createSelector([getTransactions], transactions => {
  const income = [];
  const expenses = []
  transactions.forEach(t => {
    if (t.amount < 0) expenses.push(t);
    else income.push(t);
  })
  return [income, expenses];
});

const getSortedCategoryExpenses = createSelector([getIncomeAndExpenses], ([_, expenses]) => {
  return nest()
    .key(d => d.category.id)
    .rollup(transactions => ({
      transactions,
      category: transactions[0].category,
      amount: Math.abs(sum(transactions, d => d.amount))
    }))
    .entries(expenses)
    .sort((a, b) => b.value.amount - a.value.amount)
});


const mapStateToProps = state => {
  const dateSelect = getDateSelect(state);
  const baseCurrency = getBaseCurrency(state);
  const currencies = getCurrencies(state);
  const accounts = getAccounts(state);
  const categories = getCategories(state);

  const filterCategories = state.edit.charts.filterCategories || new Set();

  const transactions = getTransactions(state);

  // Calculate some commonly used subsets of the filtered data.
  const [income, expenses] = getIncomeAndExpenses(state);
  const sortedCategoryExpenses = getSortedCategoryExpenses(state);

  return {
    dateSelectId,
    baseCurrency,
    categories,
    filterCategories,
    transactions,
    currencies,
    accounts,
    expenses,
    income,
    sortedCategoryExpenses,
    startDate: dateSelect.startDate,
    endDate: dateSelect.endDate,
    currencyRates: state.edit.currencyRates,
    groupByParentCategory: state.edit.charts.groupByParentCategory,
    noData: state.transactions.data.length === 0
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleDatesChange: (dateSelectId, startDate, endDate) => {
      dispatch(actions.editDates(dateSelectId, startDate, endDate));
    },
    handleBaseCurrencyChange: baseCurrency => {
      dispatch(actions.setChartsBaseCurrency(baseCurrency));
    },
    handleGroupByParentCategoryChange: enabled => {
      dispatch(actions.setChartsGroupByParentCategory(enabled));
    },
    ensureCurrencyRates: currencies => {
      dispatch(actions.fetchCurrencyRates(currencies));
    },
    handleCategoryChange: categoryIds => {
      dispatch(actions.setChartsFilterCategories(categoryIds));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Charts);