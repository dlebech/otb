import React from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import moment from 'moment';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';
import { uncategorized } from '../data/categories';
import * as actions from '../actions';
import { convertCurrency, findCategory } from '../util';
import NoData from './NoData';
import Dates from './Dates';
import Summary from './charts/Summary';
import AmountSumBar from './charts/AmountSumBar';
import IncomeExpensesLine from './charts/IncomeExpensesLine';
import Loading from './shared/Loading';

const CategoryExpenses = Loadable({
  loader: () => import('./charts/CategoryExpenses'),
  loading: Loading
});

const Charts = props => {
  if (props.transactions.length === 0) return <NoData />;

  let filteredTransactions = props.transactions.filter(t => {
    return !t.ignore &&
      moment(t.date).isBetween(props.startDate, props.endDate, 'day', '[]');
  });

  const currencies = props.accounts
    .filter(a => !!a.currency)
    .map(a => a.currency);

  if (!props.currencyRates && currencies.length > 1) {
    props.ensureCurrencyRates(currencies);
    return <Loading />;
  }

  const accounts = props.accounts.reduce((obj, acct) => {
    obj[acct.id] = acct;
    return obj;
  }, {});

  if (currencies.length > 1) {
    filteredTransactions = filteredTransactions.map(t => {
      return Object.assign({}, t, {
        amount: convertCurrency(
          t.amount,
          accounts[t.account].currency,
          props.baseCurrency,
          t.date,
          props.currencyRates
        ),
        currency: props.baseCurrency,
        originalAmount: t.amount,
        originalCurrency: accounts[t.account].currency
      });
    });
  }

  // Calculate some commonly used subsets of the filtered data.
  const expenses = filteredTransactions.filter(t => t.amount < 0);
  const income = filteredTransactions.filter(t => t.amount >= 0);
  const sortedCategoryExpenses = nest()
    .key(d => d.category.confirmed || uncategorized.id)
    .rollup(transactions => ({
      transactions,
      category: findCategory(
        props.categories,
        transactions[0].category.confirmed || uncategorized.id
      ),
      amount: Math.abs(sum(transactions, d => d.amount))
    }))
    .entries(expenses)
    .sort((a, b) => b.value.amount - a.value.amount);

  return (
    <>
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
      <section>
        <Summary
          expenses={expenses}
          income={income}
          sortedCategoryExpenses={sortedCategoryExpenses}
          accounts={props.accounts}
          baseCurrency={props.baseCurrency}
        />
      </section>
      <section className="mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <h4 className="text-center">Income and expenses over time</h4>
            <IncomeExpensesLine
              transactions={filteredTransactions}
              startDate={props.startDate}
              endDate={props.endDate}
            />
          </div>
          <div className="col-lg-6">
            <h4 className="text-center">Sum of income and expenses over time</h4>
            <AmountSumBar
              transactions={filteredTransactions}
            />
          </div>
        </div>
      </section>
      <section className="mt-5">
        <CategoryExpenses
          filterCategories={props.filterCategories}
          handleCategoryChange={props.handleCategoryChange}
          handleCategorySortingChange={props.handleCategorySortingChange}
          sortedCategoryExpenses={sortedCategoryExpenses}
          startDate={props.startDate}
          endDate={props.endDate}
        />
      </section>
    </>
  );
};

const mapStateToProps = state => {
  const dateSelectId = 'chart-dates';
  const dateSelect = state.edit.dateSelect[dateSelectId] || {
    startDate: moment().subtract(3, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  };

  // If not explicitly set, the base currency is just the currency of the first
  // account (usually the default)
  const baseCurrency = state.edit.charts.baseCurrency ||
    (state.accounts.data.find(a => !!a.currency) || {}).currency ||
    null;

  const filterCategories = state.edit.charts.filterCategories || new Set();

  const categories = state.categories.data.reduce((obj, category) => {
    obj[category.id] = category;
    return obj;
  }, {});

  return {
    dateSelectId,
    baseCurrency,
    categories,
    filterCategories,
    transactions: state.transactions.data,
    accounts: state.accounts.data,
    startDate: dateSelect.startDate,
    endDate: dateSelect.endDate,
    currencyRates: state.edit.currencyRates,
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
    ensureCurrencyRates: currencies => {
      dispatch(actions.fetchCurrencyRates(currencies));
    },
    handleCategoryChange: categoryIds => {
      dispatch(actions.setChartsFilterCategories(categoryIds));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Charts);