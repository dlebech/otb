import chunk from 'lodash/chunk';
import { sleep } from './util';
import { lambdaBase } from './config';

export const TOGGLE_LOCAL_STORAGE = 'TOGGLE_LOCAL_STORAGE';

// Import actions
export const IMPORT_PARSE_TRANSACTIONS_START = 'IMPORT_PARSE_TRANSACTIONS_START';
export const IMPORT_PARSE_TRANSACTIONS_END = 'IMPORT_PARSE_TRANSACTIONS_END';
export const IMPORT_SAVE_TRANSACTIONS = 'IMPORT_SAVE_TRANSACTIONS';
export const IMPORT_CANCEL_TRANSACTIONS = 'IMPORT_CANCEL_TRANSACTIONS';
export const IMPORT_UPDATE_SKIP_ROWS = 'IMPORT_UPDATE_SKIP_ROWS';
export const IMPORT_UPDATE_COLUMN_TYPE = 'IMPORT_UPDATE_COLUMN_TYPE';
export const IMPORT_UPDATE_ACCOUNT = 'IMPORT_UPDATE_ACCOUNT';

// Account actions
export const ADD_ACCOUNT = 'ADD_ACCOUNT';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT';

// Category actions
export const ADD_CATEGORY = 'ADD_CATEGORY';
export const UPDATE_CATEGORY = 'UPDATE_CATEGORY';
export const DELETE_CATEGORY = 'DELETE_CATEGORY';

export const GUESS_CATEGORY_FOR_ROW = 'GUESS_CATEGORY_FOR_ROW';
export const CATEGORIZE_ROW = 'CATEGORIZE_ROW';
export const IGNORE_ROW = 'IGNORE_ROW';
export const DELETE_ROW = 'DELETE_ROW';
export const RESTORE_STATE_FROM_FILE = 'RESTORE_STATE_FROM_FILE';

export const EDIT_DATES = 'EDIT_DATES';
export const CREATE_TEST_DATA = 'CREATE_TEST_DATA';
export const START_GUESS_ALL_CATEGORIES = 'START_GUESS_ALL_CATEGORIES';
export const END_GUESS_ALL_CATEGORIES = 'END_GUESS_ALL_CATEGORIES';
export const SET_CURRENCIES = 'SET_CURRENCIES';
export const START_FETCH_CURRENCIES = 'START_FETCH_CURRENCIES';
export const END_FETCH_CURRENCIES = 'END_FETCH_CURRENCIES';

// Transaction list edit changes
export const SET_TRANSACTION_LIST_PAGE = 'SET_TRANSACTION_LIST_PAGE';
export const SET_TRANSACTION_LIST_PAGE_SIZE = 'SET_TRANSACTION_LIST_PAGE_SIZE';
export const SET_TRANSACTION_LIST_SORT = 'SET_TRANSACTION_LIST_SORT';
export const SET_TRANSACTION_LIST_FILTER_CATEGORIES = 'SET_TRANSACTION_LIST_FILTER_CATEGORIES';

export const SET_EMPTY_TRANSACTIONS_ACCOUNT = 'SET_EMPTY_TRANSACTIONS_ACCOUNT';

export const toggleLocalStorage = enabled => {
  return {
    type: TOGGLE_LOCAL_STORAGE,
    enabled
  };
};

export const importParseTransactionsStart = () => {
  return {
    type: IMPORT_PARSE_TRANSACTIONS_START
  };
};

export const importParseTransactionsEnd = (error, transactions) => {
  return {
    type: IMPORT_PARSE_TRANSACTIONS_END,
    transactions
  };
};

export const importUpdateSkipRows = skipRows => {
  return {
    type: IMPORT_UPDATE_SKIP_ROWS,
    skipRows
  };
};

export const importUpdateColumnType = (columnIndex, columnType) => {
  return {
    type: IMPORT_UPDATE_COLUMN_TYPE,
    columnIndex,
    columnType
  };
};

export const importUpdateAccount = accountId => {
  return {
    type: IMPORT_UPDATE_ACCOUNT,
    accountId
  };
};

export const importSaveTransactions = () => {
  return {
    type: IMPORT_SAVE_TRANSACTIONS
  };
};

export const importCancelTransactions = () => {
  return {
    type: IMPORT_CANCEL_TRANSACTIONS
  };
};

export const addAccount = (name, currency) => {
  return {
    type: ADD_ACCOUNT,
    name,
    currency
  };
};

export const updateAccount = (accountId, name, currency) => {
  return {
    type: UPDATE_ACCOUNT,
    accountId,
    name,
    currency
  };
};

export const deleteAccount = accountId => {
  return {
    type: DELETE_ACCOUNT,
    accountId
  };
};

export const guessCategoryForRow = rowId => {
  return {
    type: GUESS_CATEGORY_FOR_ROW,
    rowId
  };
};

export const categorizeRow = (rowId, categoryId) => {
  return {
    type: CATEGORIZE_ROW,
    rowId,
    categoryId
  };
};

export const ignoreRow = (rowId, ignore) => {
  return {
    type: IGNORE_ROW,
    rowId,
    ignore
  };
};

export const deleteRow = rowId => {
  return {
    type: DELETE_ROW,
    rowId
  };
};

export const restoreStateFromFile = newState => {
  return {
    type: RESTORE_STATE_FROM_FILE,
    newState
  };
};

export const addCategory = (name, parentId) => {
  return {
    type: ADD_CATEGORY,
    name,
    parentId
  };
};

export const addCategoryWithRow = (name, parentId, rowId) => {
  return (dispatch, getState) => {
    // First add the new category
    dispatch(addCategory(name, parentId));

    // Then find the updated categories so we can get the category ID.
    // The new category is probably the last one in the array, but just to be
    // safe, let's loop through them... but backwards for that wee bit of extra
    // speed :-)
    const categories = getState().categories.data;
    for (let i = categories.length - 1; i >= 0; i--) {
      if (categories[i].name === name) {
        dispatch(categorizeRow(rowId, categories[i].id));
        break;
      }
    }
  };
};

export const updateCategory = (categoryId, name, parentId) => {
  return {
    type: UPDATE_CATEGORY,
    categoryId,
    name,
    parentId
  };
};

export const deleteCategory = categoryId => {
  return {
    type: DELETE_CATEGORY,
    categoryId
  };
};

export const editDates = (dateSelectId, startDate, endDate) => {
  return {
    type: EDIT_DATES,
    dateSelectId,
    startDate,
    endDate
  };
};

export const setTransactionListPage = page => {
  return {
    type: SET_TRANSACTION_LIST_PAGE,
    page
  };
};

export const setTransactionListPageSize = (pageSize, numTransactions) => {
  return {
    type: SET_TRANSACTION_LIST_PAGE_SIZE,
    pageSize,
    numTransactions
  };
};

export const setTransactionListSort = (sortKey, sortAscending) => {
  return {
    type: SET_TRANSACTION_LIST_SORT,
    sortKey,
    sortAscending
  };
};

export const setTransactionListFilterCategories = (filterCategories, numTransactions) => {
  return {
    type: SET_TRANSACTION_LIST_FILTER_CATEGORIES,
    filterCategories,
    numTransactions
  };
};

export const setEmptyTransactionsAccount = accountId => {
  return {
    type: SET_EMPTY_TRANSACTIONS_ACCOUNT,
    accountId
  };
};

export const createTestData = () => ({ type: CREATE_TEST_DATA });

export const startGuessAllCategories = () => ({ type: START_GUESS_ALL_CATEGORIES });
export const endGuessAllCategories = () => ({ type: END_GUESS_ALL_CATEGORIES });

export const startFetchCurrencies = () => ({ type: START_FETCH_CURRENCIES });
export const endFetchCurrencies = () => ({ type: END_FETCH_CURRENCIES });

export const setCurrencies = currencies => {
  return {
    type: SET_CURRENCIES,
    currencies
  };
};

export const guessAllCategories = () => {
  return async (dispatch, getState) => {
    while (getState().app.isCategoryGuessing) {
      await sleep(100);
    }
    // Determine the diversity of currently guessed categories
    const guessedCategories = new Set(
      getState().transactions.data
        .filter(t => !!t.category.confirmed)
        .map(t => t.category.confirmed)
    );
    if (guessedCategories.size < 3) return;

    dispatch(startGuessAllCategories());

    const transactionsToGuess = chunk(
      getState().transactions.data
        .filter(t => !t.category.confirmed && !t.ignore)
        .map(t => t.id),
      100
    );

    for (let i = 0; i < transactionsToGuess.length; i++) {
      await dispatch(guessCategoryForRow(transactionsToGuess[i]));
      await sleep(10);
    }

    dispatch(endGuessAllCategories());
  };
};

export const fetchCurrencies = () => {
  return async dispatch => {
    dispatch(startFetchCurrencies());
    const currencies = await fetch(`${lambdaBase}/currencies`).then(res => res.json());
    dispatch(setCurrencies(currencies));
    dispatch(endFetchCurrencies());
  };
};
