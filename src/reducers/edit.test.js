import reducers from './index';
import * as actions from '../actions';

it('should set the date selection for the given dates', () => {
  const state = reducers({
    edit: {
      dateSelect: {}
    }
  }, actions.editDates('a', '2018-01-01', '2018-01-02'));

  // The rest of their state is managed internally
  expect(state.edit.dateSelect['a']).toEqual({
    startDate: '2018-01-01',
    endDate: '2018-01-02'
  });
});

it('should handle page change for transactions', () => {
  const state = reducers({
    edit: {
      transactionList: {
        page: 1
      }
    }
  }, actions.setTransactionListPage(2));

  expect(state.edit.transactionList.page).toEqual(2);
});

it('should handle page size change for transactions', () => {
  const state = reducers({
    edit: {
      transactionList: {
        pageSize: 50
      }
    }
  }, actions.setTransactionListPageSize(100));

  expect(state.edit.transactionList.pageSize).toEqual(100);
});

it('should change page if current page is too high for page size', () => {
  const state = reducers({
    edit: {
      transactionList: {
        page: 2,
        pageSize: 50
      }
    }
  }, actions.setTransactionListPageSize(100, 70));

  expect(state.edit.transactionList.pageSize).toEqual(100);
  expect(state.edit.transactionList.page).toEqual(1);
});

it('should handle sort change for transactions', () => {
  const state = reducers({
    edit: {
      transactionList: {
        sortKey: 'date',
        sortAscending: false
      }
    }
  }, actions.setTransactionListSort('description', true));

  expect(state.edit.transactionList.sortKey).toEqual('description');
  expect(state.edit.transactionList.sortAscending).toEqual(true);
});

it('should handle filter categories change for transactions', () => {
  const state = reducers({
    edit: {
      transactionList: {
        filterCategories: []
      }
    }
  }, actions.setTransactionListFilterCategories(new Set(['abcd'])));

  expect(state.edit.transactionList.filterCategories).toEqual(new Set(['abcd']));
});

it('should change page if current page is too high for filter categories', () => {
  const state = reducers({
    edit: {
      transactionList: {
        filterCategories: [],
        page: 2,
        pageSize: 50
      }
    }
  }, actions.setTransactionListFilterCategories(new Set(['abcd']), 40));

  expect(state.edit.transactionList.filterCategories).toEqual(new Set(['abcd']));
  expect(state.edit.transactionList.page).toEqual(1);
});

it('should handle currencies', () => {
  const state = reducers({}, actions.setCurrencies(['USD', 'JPY']));
  expect(state.edit.currencies).toEqual(['USD', 'JPY']);
})

it('should handle currency rates', () => {
  const rates = {
    '2018-01-01': {
      SEK: 9.5,
      DKK: 7.5
    }
  };
  const state = reducers({}, actions.setCurrencyRates(rates));
  expect(state.edit.currencyRates).toEqual(rates);
})

it('should handle round amounts', () => {
  const state = reducers({
    edit: {
      transactionList: {}
    }
  }, actions.setTransactionListRoundAmount(true));

  expect(state.edit.transactionList.roundAmount).toEqual(true);
});

it('should set base currency for charts', () => {
  const state = reducers({
    edit: {
      charts: {}
    }
  }, actions.setChartsBaseCurrency('DKK'));

  expect(state.edit.charts.baseCurrency).toEqual('DKK');
});

it('should handle filter categories change for charts', () => {
  const state = reducers({
    edit: {
      charts: {}
    }
  }, actions.setChartsFilterCategories(['abcd']));

  expect(state.edit.charts.filterCategories).toEqual(new Set(['abcd']));
});

it('should handle the parsing start action', () => {
  expect(reducers({}, actions.importParseTransactionsStart()).edit.isParsing).toEqual(true);
});

it('should set parsing to false on parse transaction ending', () => {
  const state = reducers({ edit: { isParsing: true } }, actions.importParseTransactionsEnd([['2018-04-06', 'test row', 123, 456]]));
  expect(state.edit.isParsing).toEqual(false);
});

it('should handle the guess start action', () => {
  expect(reducers({}, actions.guessAllCategoriesStart()).edit.isCategoryGuessing).toEqual(true);
});

it('should handle the guess end action', () => {
  expect(reducers({ edit: { isCategoryGuessing: true } }, actions.guessAllCategoriesEnd({})).edit.isCategoryGuessing).toEqual(false);
});

it('should handle fetch currencies start action', () => {
  expect(reducers({}, actions.startFetchCurrencies()).edit.isFetchingCurrencies).toEqual(true);
});

it('should handle fetch currencies end action', () => {
  expect(reducers({ edit: { isFetchingCurrencies: true } }, actions.endFetchCurrencies()).edit.isFetchingCurrencies).toEqual(false);
});

it('should handle fetch currency rates start action', () => {
  expect(reducers({}, actions.startFetchCurrencyRates()).edit.isFetchingCurrencyRates).toEqual(true);
});

it('should handle fetch currency rates end action', () => {
  expect(reducers({ edit: { isFetchingCurrencyRates: true } }, actions.endFetchCurrencyRates()).edit.isFetchingCurrencyRates).toEqual(false);
});