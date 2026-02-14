import update from 'immutability-helper';
import { AnyAction } from 'redux';
import * as actions from '../actions';
import {
  type EditState
} from '../types/app';

const initialEditor: EditState = {
  isCategoryGuessing: false,
  isParsing: false,
  isFetchingCurrencies: false,
  isFetchingCurrencyRates: false,
  dateSelect: {},
  transactionList: {
    page: 1,
    pageSize: 50,
    sortKey: 'date',
    sortAscending: false,
    filterCategories: new Set()
  },
  charts: {}
};

const determinePage = (page: number, pageSize: number, numTransactions: number): number => {
  // Check that the new page does not exceed the existing page.
  if (numTransactions > 0) {
    const lastPage = Math.ceil(numTransactions / pageSize);
    if (lastPage < page) page = lastPage;
  }

  return page;
};

const editReducer = (state: EditState = initialEditor, action: AnyAction): EditState => {
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
    case 'SET_TRANSACTION_LIST_PAGE':
      return update(state, {
        transactionList: {
          page: {
            $set: action.page
          }
        }
      });
    case 'SET_TRANSACTION_LIST_PAGE_SIZE':
      return update(state, {
        transactionList: {
          page: {
            $set: determinePage(state.transactionList.page, action.pageSize, action.numTransactions)
          },
          pageSize: {
            $set: action.pageSize
          }
        }
      });
    case 'SET_TRANSACTION_LIST_SORT':
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
    case 'SET_TRANSACTION_LIST_FILTER_CATEGORIES':
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
    case 'SET_TRANSACTION_LIST_ROUND_AMOUNT':
      return update(state, {
        transactionList: {
          roundAmount: {
            $set: action.enabled
          }
        }
      });
    case 'SET_CURRENCIES':
      return update(state, {
        currencies: {
          $set: action.currencies
        }
      });
    case 'SET_CURRENCY_RATES':
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
    case actions.SET_CHARTS_FILTER_CATEGORIES:
      return update(state, {
        charts: {
          filterCategories: {
            $set: new Set(action.categoryIds)
          }
        }
      });
    case actions.SET_CHARTS_GROUP_BY_PARENT_CATEGORY:
      return update(state, {
        charts: {
          groupByParentCategory: {
            $set: action.enabled
          }
        }
      });
    case 'GUESS_ALL_CATEGORIES_START':
      return update(state, {
        isCategoryGuessing: { $set: true }
      });
    case 'GUESS_ALL_CATEGORIES_END':
      return update(state, {
        isCategoryGuessing: { $set: false }
      });
    case 'START_FETCH_CURRENCIES':
      return update(state, {
        isFetchingCurrencies: { $set: true }
      });
    case 'START_FETCH_CURRENCY_RATES':
      return update(state, {
        isFetchingCurrencyRates: { $set: true }
      });
    case 'END_FETCH_CURRENCIES':
      return update(state, {
        isFetchingCurrencies: { $set: false }
      });
    case 'END_FETCH_CURRENCY_RATES':
      return update(state, {
        isFetchingCurrencyRates: { $set: false }
      });
    case 'IMPORT_PARSE_TRANSACTIONS_START':
      return update(state, {
        isParsing: { $set: true }
      });
    case actions.IMPORT_PARSE_TRANSACTIONS_END:
      return update(state, {
        isParsing: { $set: false }
      });
    default:
      return state;
  }
};

export default editReducer;
