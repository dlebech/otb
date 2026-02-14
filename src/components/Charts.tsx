import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch, Transaction, Account, Category } from '../types/redux';
import dynamic from 'next/dynamic';
import moment, { Moment } from 'moment';
import { nest } from 'd3-collection';
import { type TransactionGroup, type CategoryExpense } from '../types/app';
import { sum } from 'd3-array';
import { createSelector } from 'reselect';
import { uncategorized } from '../data/categories';
import * as actions from '../actions';
import { convertCurrency, findCategory, arrayToObjectLookup, reverseIndexLookup } from '../util';
import { RootState } from '../reducers';
import NoData from './NoData';
import Dates from './Dates';
import Summary from './charts/Summary';
import AmountSumBar from './charts/AmountSumBar';
import IncomeExpensesLine from './charts/IncomeExpensesLine';
import Loading from './shared/Loading';

const CategoryExpenses = dynamic(() => import('./charts/CategoryExpenses'), {
  loading: () => <Loading />
});

// The following functions are used to avoid doing expensive filtering multiple times.
const dateSelectId = 'chart-dates';
const _getDateSelects = (state: RootState) => state.edit.dateSelect;
const _getAccounts = (state: RootState) => state.accounts.data;
const _getCategories = (state: RootState) => state.categories.data;
const _getBaseCurrency = (state: RootState) => state.edit.charts.baseCurrency;
const _getTransactions = (state: RootState) => state.transactions.data;
const _getTransactionGroups = (state: RootState) => state.transactions.groups;
const _getCurrencyRates = (state: RootState) => state.edit.currencyRates;
const getGroupByParentCategory = (state: RootState) => state.edit.charts.groupByParentCategory;

const getDateSelect = createSelector([_getDateSelects], (dateSelects: Record<string, { startDate: string | null; endDate: string | null }>) => {
  const dateSelect = dateSelects[dateSelectId];
  if (dateSelect) {
    return {
      startDate: dateSelect.startDate ? moment(dateSelect.startDate) : null,
      endDate: dateSelect.endDate ? moment(dateSelect.endDate) : null
    };
  }
  return {
    startDate: moment().subtract(3, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  };
});

const getBaseCurrency = createSelector(
  [_getAccounts, _getBaseCurrency],
  (accounts: Account[], baseCurrency: string | undefined) => {
    // If not explicitly set, the base currency is just the currency of the first
    // account (usually the default)
    return baseCurrency || (accounts.find((a: Account) => !!a.currency) || {} as Account).currency || null;
  }
);

const getCurrencies = createSelector([_getAccounts], (accounts: Account[]) => {
  return Array.from(
    new Set(accounts.filter((a: Account) => !!a.currency).map((a: Account) => a.currency as string))
  ).sort();
});

const getAccounts = createSelector([_getAccounts], (accounts: Account[]) => arrayToObjectLookup(accounts));
const getCategories = createSelector([_getCategories], (categories: Category[]) => arrayToObjectLookup(categories));

const _getTransactionsWithGrouping = createSelector(
  [_getTransactions, _getTransactionGroups],
  (transactions: Transaction[], transactionGroups: { [key: string]: TransactionGroup } | undefined) => {
    if (!transactionGroups) return transactions;

    // Copy the array because we will manipulate it below...
    let transactionsData = [...transactions];

    // Create a reverse index lookup table for easier transaction access.
    const reverseLookup = reverseIndexLookup(transactionsData);

    const transactionsToRemove = new Set();

    // For each of the groups:
    // 1. Find the primary transaction
    // 2. Calculate a new amount for the primary transaction
    // 3. Replace the existing transaction and remove linked transactions
    // XXX: In the future, this summing of amounts might be changed by a group
    // parameter. This is just the default behavior for now and it should work
    // well for e.g. refunds
    Object.entries(transactionGroups)
      .forEach(([, group]: [string, TransactionGroup]) => {
        const primaryTransactionIndex = reverseLookup[group.primaryId];
        const primaryTransaction = transactionsData[primaryTransactionIndex];

        const linkedTransactionAmounts = group.linkedIds.map((id: string) => {
          transactionsToRemove.add(id); // Yay side effects :-)
          return transactionsData[reverseLookup[id]].amount;
        });

        const newTransaction = Object.assign({}, primaryTransaction, {
          // TODO: Handle different currencies?
          amount: sum([primaryTransaction.amount, ...linkedTransactionAmounts])
        });

        transactionsData.splice(primaryTransactionIndex, 1, newTransaction);
      });

    transactionsData = transactionsData.filter((t: Transaction) => !transactionsToRemove.has(t.id));
    return transactionsData;
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
    transactions: Transaction[],
    dateSelect: { startDate: Moment | null; endDate: Moment | null },
    accounts: Record<string, Account>,
    categories: Record<string, Category>,
    currencies: string[],
    currencyRates: Record<string, Record<string, number>> | undefined,
    baseCurrency: string | null,
    groupByParentCategory: boolean | undefined
  ) => {
    let filteredTransactions = transactions.filter((t: Transaction) => {
      return !t.ignore &&
        moment(t.date).isBetween(dateSelect.startDate, dateSelect.endDate, 'day', '[]');
    });

    filteredTransactions = filteredTransactions.map((t: Transaction) => {
      let newTransaction = Object.assign({}, t, {
        category: findCategory(
          categories,
          t.category.confirmed || uncategorized.id,
          true,
          !!groupByParentCategory
        )
      });

      const accountCurrency = t.account ? accounts[t.account]?.currency : undefined;
      if (currencies.length > 1 && currencyRates && baseCurrency && accountCurrency) {
        newTransaction = Object.assign({}, newTransaction, {
          amount: convertCurrency(
            t.amount,
            accountCurrency,
            baseCurrency,
            t.date,
            currencyRates
          ),
          currency: baseCurrency,
          originalAmount: t.amount,
          originalCurrency: accountCurrency
        });
      }

      return newTransaction;
    });

    return filteredTransactions;
  }
);

const getIncomeAndExpenses = createSelector([getTransactions], (transactions: Transaction[]) => {
  const income: Transaction[] = [];
  const expenses: Transaction[] = [];
  transactions.forEach((t: Transaction) => {
    if (t.amount < 0) expenses.push(t);
    else income.push(t);
  });
  return [income, expenses];
});

const getSortedCategoryExpenses = createSelector(
  [getIncomeAndExpenses],
  (incomeAndExpenses: Transaction[][]): CategoryExpense[] => {
    const expenses = incomeAndExpenses[1];
    return (nest<Transaction>()
      .key((d: Transaction) => (d.category as unknown as Category).id)
      // @ts-expect-error d3-collection types: .key() this-return doesn't track .rollup() generic
      .rollup((transactions: Transaction[]) => ({
        transactions,
        category: transactions[0].category as unknown as Category,
        amount: Math.abs(sum(transactions, (d: Transaction) => d.amount))
      }))
      .entries(expenses) as unknown as CategoryExpense[])
      .sort((a: CategoryExpense, b: CategoryExpense) => b.value.amount - a.value.amount);
  }
);

export default function Charts() {
  const dispatch = useDispatch<AppDispatch>();
  
  const {
    baseCurrency,
    categories,
    filterCategories,
    transactions,
    currencies,
    accounts,
    expenses,
    income,
    sortedCategoryExpenses,
    startDate,
    endDate,
    currencyRates,
    groupByParentCategory,
    noData
  } = useSelector((state: RootState) => {
    const dateSelect = getDateSelect(state);
    const baseCurrency = getBaseCurrency(state);
    const currencies = getCurrencies(state);
    const accounts = getAccounts(state);
    const categories = getCategories(state);

    const filterCategories = new Set(state.edit.charts.filterCategories || []);

    const transactions = getTransactions(state);

    // Calculate some commonly used subsets of the filtered data.
    const [income, expenses] = getIncomeAndExpenses(state);
    const sortedCategoryExpenses = getSortedCategoryExpenses(state);

    return {
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
  });

  const handleDatesChange = (dateSelectId: string, startDate: Moment | null, endDate: Moment | null) => {
    dispatch(actions.editDates(
      dateSelectId, 
      startDate ? startDate.format('YYYY-MM-DD') : null,
      endDate ? endDate.format('YYYY-MM-DD') : null
    ));
  };

  const handleBaseCurrencyChange = (baseCurrency: string) => {
    dispatch(actions.setChartsBaseCurrency(baseCurrency));
  };

  const handleGroupByParentCategoryChange = (enabled: boolean) => {
    dispatch(actions.setChartsGroupByParentCategory(enabled));
  };

  const needsCurrencyRates = !currencyRates && currencies.length > 1;

  useEffect(() => {
    if (needsCurrencyRates) {
      dispatch(actions.fetchCurrencyRates(currencies));
    }
  }, [needsCurrencyRates, dispatch, currencies]);

  const handleCategoryChange = (categoryIds: string[]) => {
    dispatch(actions.setChartsFilterCategories(categoryIds));
  };

  if (noData) return <NoData />;

  if (needsCurrencyRates || !startDate || !endDate) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex-1">
          <Dates
            id={dateSelectId}
            startDate={startDate}
            endDate={endDate}
            handleDatesChange={handleDatesChange}
          />
        </div>
        <div className="md:w-auto">
          {currencies.length > 1 && <div className="flex flex-wrap gap-6 items-center">
            <div className="w-auto">
              <label className="my-0" htmlFor="base-currency">Base currency</label>
            </div>
            <div className="flex-1">
              <select
                id="base-currency"
                className="block w-full rounded border border-gray-300 px-3 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={baseCurrency ?? ''}
                onChange={e => handleBaseCurrencyChange(e.target.value)}
              >
                {currencies.map((c: string) => {
                  return <option key={`base-currency-${c}`} value={c}>{c}</option>;
                })}
              </select>
            </div>
          </div>}
        </div>
        <div className="md:w-auto">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="group-by-parent-categories"
                className="mr-2"
                checked={groupByParentCategory ?? false}
                onChange={e => handleGroupByParentCategoryChange(e.target.checked)}
              />
              <label className="text-sm" htmlFor="group-by-parent-categories">
                Show only parent categories
              </label>
            </div>
          </div>
        </div>
      </div>
      <section>
        <Summary
          expenses={expenses}
          income={income}
          sortedCategoryExpenses={sortedCategoryExpenses}
          accounts={accounts}
        />
      </section>
      <section className="mt-12">
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="w-full lg:flex-1">
            <h4 className="text-center">Income and expenses over time</h4>
            <IncomeExpensesLine
              transactions={transactions}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div className="w-full lg:flex-1">
            <h4 className="text-center">Sum of income and expenses over time</h4>
            <AmountSumBar
              transactions={transactions}
            />
          </div>
        </div>
      </section>
      <section className="mt-12">
        <CategoryExpenses
          filterCategories={filterCategories}
          categories={categories}
          handleCategoryChange={handleCategoryChange}
          sortedCategoryExpenses={sortedCategoryExpenses}
          startDate={startDate}
          endDate={endDate}
        />
      </section>
    </>
  );
}
