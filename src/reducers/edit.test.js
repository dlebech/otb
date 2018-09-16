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
  }, actions.setTransactionListFilterCategories(['abcd']));

  expect(state.edit.transactionList.filterCategories).toEqual(['abcd']);
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
  }, actions.setTransactionListFilterCategories(['abcd'], 40));

  expect(state.edit.transactionList.filterCategories).toEqual(['abcd']);
  expect(state.edit.transactionList.page).toEqual(1);
});

it('should handle currencies', () => {
  const state = reducers({}, actions.setCurrencies(['USD', 'JPY']));
  expect(state.edit.currencies).toEqual(['USD', 'JPY']);
});