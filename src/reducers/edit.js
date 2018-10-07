import update from 'immutability-helper';
import * as actions from '../actions';

const initialEditor = {
  dateSelect: {},
  transactionList: {
    page: 1,
    pageSize: 50,
    sortKey: 'date',
    sortAscending: true,
    filterCategories: new Set()
  },
  charts: {}
};

const determinePage = (page, pageSize, numTransactions) => {
  // Check that the new page does not exceed the existing page.
  if (numTransactions > 0) {
    const lastPage = Math.ceil(numTransactions / pageSize);
    if (lastPage < page) page = lastPage;
  }

  return page;
};

const editReducer = (state = initialEditor, action) => {
  switch (action.type) {
    case actions.EDIT_DATES:
      return update(state, {
        dateSelect: {
          [action.dateSelectId]: {
            $set: {
              startDate: action.startDate,
              endDate: action.endDate
            }
          }
        }
      });
    case actions.SET_TRANSACTION_LIST_PAGE:
      return update(state, {
        transactionList: {
          page: {
            $set: action.page
          }
        }
      });
    case actions.SET_TRANSACTION_LIST_PAGE_SIZE:
      return update(state, {
        transactionList: {
          pageSize: {
            $set: action.pageSize
          },
          page: {
            $set: determinePage(state.transactionList.page, action.pageSize, action.numTransactions)
          }
        }
      });
    case actions.SET_TRANSACTION_LIST_SORT:
      return update(state, {
        transactionList: {
          sortKey: {
            $set: action.sortKey
          },
          sortAscending: {
            $set: action.sortAscending
          }
        }
      });
    case actions.SET_TRANSACTION_LIST_FILTER_CATEGORIES:
      return update(state, {
        transactionList: {
          filterCategories: {
            $set: new Set(action.filterCategories)
          },
          page: {
            $set: determinePage(state.transactionList.page, state.transactionList.pageSize, action.numTransactions)
          }
        }
      });
    case actions.SET_TRANSACTION_LIST_ROUND_AMOUNT:
      return update(state, {
        transactionList: {
          roundAmount: {
            $set: action.enabled
          }
        }
      });
    case actions.SET_CURRENCIES:
      return update(state, {
        currencies: {
          $set: action.currencies
        }
      });
    case actions.SET_CURRENCY_RATES:
      return update(state, {
        currencyRates: {
          $set: action.currencyRates
        }
      });
    case actions.SET_CHARTS_BASE_CURRENCY:
      return update(state, {
        charts: {
          baseCurrency: {
            $set: action.baseCurrency
          }
        }
      });
    default:
      return state;
  }
};

export default editReducer;
