import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import * as actions from '../actions';
import { convertCurrency } from '../util';
import NoData from './NoData';
import Dates from './Dates';
import Summary from './charts/Summary';
import AmountSumArea from './charts/AmountSumArea';
import IncomesExpensesLine from './charts/IncomeExpensesLine';
import CategoryTreeMap from './charts/CategoryTreeMap';
import Loading from './shared/Loading';

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
      <Summary
        transactions={filteredTransactions}
        categories={props.categories}
        accounts={props.accounts}
        baseCurrency={props.baseCurrency}
      />
      <div className="row justify-content-center">
        <div className="col-6">
          <h4 className="text-center">Income and expenses over time</h4>
          <IncomesExpensesLine
            transactions={filteredTransactions}
            startDate={props.startDate}
            endDate={props.endDate}
          />
        </div>
        <div className="col-6">
          <h4 className="text-center">Sum of income and expenses over time</h4>
          <AmountSumArea
            transactions={filteredTransactions}
          />
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col">
          <h4 className="text-center">Categories where money is spent</h4>
          <CategoryTreeMap
            transactions={filteredTransactions}
            categories={props.categories}
          />
        </div>
      </div>
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

  return {
    dateSelectId,
    baseCurrency,
    transactions: state.transactions.data,
    categories: state.categories.data,
    accounts: state.accounts.data,
    startDate: dateSelect.startDate,
    endDate: dateSelect.endDate,
    currencyRates: state.edit.currencyRates
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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Charts);