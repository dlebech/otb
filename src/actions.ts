import { createTestData as createTestDataUtil, sleep } from './util';
import { updateCategorizer, retrainCategorizer, guessCategory } from './ml';
import { type AppThunk } from './types/redux';
import chunk from 'lodash/chunk';

// Action type constants
export const TOGGLE_LOCAL_STORAGE = 'TOGGLE_LOCAL_STORAGE';
export const CREATE_TEST_DATA = 'CREATE_TEST_DATA';

// Additional action constants
export const RESTORE_STATE_FROM_FILE = 'RESTORE_STATE_FROM_FILE';
export const GUESS_ALL_CATEGORIES_END = 'GUESS_ALL_CATEGORIES_END';
export const IGNORE_TRANSACTION = 'IGNORE_TRANSACTION';
export const DELETE_TRANSACTION = 'DELETE_TRANSACTION';
export const GROUP_TRANSACTIONS = 'GROUP_TRANSACTIONS';
export const DELETE_TRANSACTION_GROUP = 'DELETE_TRANSACTION_GROUP';

// Action creators
export const toggleLocalStorage = (enabled: boolean) => ({
  type: TOGGLE_LOCAL_STORAGE,
  payload: enabled
});

export const createTestData = (): AppThunk<Promise<void>> => (dispatch) => {
  const testData = createTestDataUtil();
  
  dispatch({
    type: CREATE_TEST_DATA,
    payload: testData
  });
  
  return Promise.resolve();
};

// Re-export other action constants that might be needed
export const IMPORT_PARSE_TRANSACTIONS_START = 'IMPORT_PARSE_TRANSACTIONS_START';
export const IMPORT_PARSE_TRANSACTIONS_END = 'IMPORT_PARSE_TRANSACTIONS_END';
export const IMPORT_SAVE_TRANSACTIONS = 'IMPORT_SAVE_TRANSACTIONS';
export const IMPORT_CANCEL_TRANSACTIONS = 'IMPORT_CANCEL_TRANSACTIONS';
export const IMPORT_UPDATE_SKIP_ROWS = 'IMPORT_UPDATE_SKIP_ROWS';
export const IMPORT_UPDATE_COLUMN_TYPE = 'IMPORT_UPDATE_COLUMN_TYPE';
export const IMPORT_UPDATE_ACCOUNT = 'IMPORT_UPDATE_ACCOUNT';
export const IMPORT_SET_DATE_FORMAT = 'IMPORT_SET_DATE_FORMAT';
export const IMPORT_SET_SKIP_DUPLICATES = 'IMPORT_SET_SKIP_DUPLICATES';

// Import action creators
export const importParseTransactionsStart = () => ({
  type: IMPORT_PARSE_TRANSACTIONS_START
});

export const importParseTransactionsEnd = (data: any[][]) => ({
  type: IMPORT_PARSE_TRANSACTIONS_END,
  data
});

export const importSaveTransactions = () => ({
  type: IMPORT_SAVE_TRANSACTIONS
});

export const importCancelTransactions = () => ({
  type: IMPORT_CANCEL_TRANSACTIONS
});

export const importUpdateSkipRows = (skipRows: number) => ({
  type: IMPORT_UPDATE_SKIP_ROWS,
  skipRows
});

export const importUpdateColumnType = (columnIndex: number, columnType: string) => ({
  type: IMPORT_UPDATE_COLUMN_TYPE,
  columnIndex,
  columnType
});

export const importUpdateAccount = (accountId: string) => ({
  type: IMPORT_UPDATE_ACCOUNT,
  accountId
});

export const importSetDateFormat = (dateFormat: string) => ({
  type: IMPORT_SET_DATE_FORMAT,
  dateFormat
});

export const importSetSkipDuplicates = (enabled: boolean) => ({
  type: IMPORT_SET_SKIP_DUPLICATES,
  enabled
});

// Account actions
export const ADD_ACCOUNT = 'ADD_ACCOUNT';
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT';

// Account action creators
export const addAccount = (name: string, currency?: string) => ({
  type: ADD_ACCOUNT,
  name,
  currency
});

export const updateAccount = (accountId: string, name: string, currency?: string) => ({
  type: UPDATE_ACCOUNT,
  accountId,
  name,
  currency
});

export const deleteAccount = (accountId: string) => ({
  type: DELETE_ACCOUNT,
  accountId
});

// Category actions
export const ADD_CATEGORY = 'ADD_CATEGORY';
export const UPDATE_CATEGORY = 'UPDATE_CATEGORY';
export const DELETE_CATEGORY_START = 'DELETE_CATEGORY_START';
export const DELETE_CATEGORY_END = 'DELETE_CATEGORY_END';

// Category action creators
export const updateCategory = (categoryId: string, name: string, parentId?: string) => ({
  type: UPDATE_CATEGORY,
  categoryId,
  name,
  parentId
});

export const deleteCategory = (categoryId: string): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch({
      type: DELETE_CATEGORY_START,
      categoryId
    });

    const state = getState();
    
    // Retrain the categorizer without the deleted category
    const filteredTransactions = state.transactions.data.filter(
      (t: any) => t.category.confirmed !== categoryId
    );
    const categorizerConfig = await retrainCategorizer(filteredTransactions);

    dispatch({
      type: DELETE_CATEGORY_END,
      categoryId,
      categorizerConfig
    });
  };
};

// Transaction actions
export const CATEGORIZE_ROW_START = 'CATEGORIZE_ROW_START';
export const CATEGORIZE_ROW_END = 'CATEGORIZE_ROW_END';
export const CATEGORIZE_ROWS_START = 'CATEGORIZE_ROWS_START';
export const CATEGORIZE_ROWS_END = 'CATEGORIZE_ROWS_END';
export const GUESS_ALL_CATEGORIES_START = 'GUESS_ALL_CATEGORIES_START';
export const ADD_CATEGORY_WITH_ROW = 'ADD_CATEGORY_WITH_ROW';

// Edit actions
export const EDIT_DATES = 'EDIT_DATES';
export const SET_CHARTS_BASE_CURRENCY = 'SET_CHARTS_BASE_CURRENCY';
export const SET_CHARTS_GROUP_BY_PARENT_CATEGORY = 'SET_CHARTS_GROUP_BY_PARENT_CATEGORY';
export const SET_CHARTS_FILTER_CATEGORIES = 'SET_CHARTS_FILTER_CATEGORIES';
export const SET_CHARTS_CATEGORY_SORTING = 'SET_CHARTS_CATEGORY_SORTING';
export const START_FETCH_CURRENCIES = 'START_FETCH_CURRENCIES';
export const END_FETCH_CURRENCIES = 'END_FETCH_CURRENCIES';
export const SET_CURRENCIES = 'SET_CURRENCIES';
export const START_FETCH_CURRENCY_RATES = 'START_FETCH_CURRENCY_RATES';
export const END_FETCH_CURRENCY_RATES = 'END_FETCH_CURRENCY_RATES';
export const SET_CURRENCY_RATES = 'SET_CURRENCY_RATES';
export const FETCH_CURRENCY_RATES = 'FETCH_CURRENCY_RATES';
export const SET_EMPTY_TRANSACTIONS_ACCOUNT = 'SET_EMPTY_TRANSACTIONS_ACCOUNT';

// Restore data action creator
export const restoreStateFromFile = (state: any) => ({
  type: RESTORE_STATE_FROM_FILE,
  state
});

// Currency action creator
export const fetchCurrencies = (): AppThunk<Promise<void>> => {
  return async (dispatch) => {
    dispatch({ type: START_FETCH_CURRENCIES });

    try {
      const response = await fetch('/api/currencies');
      const currencies = await response.json();

      dispatch({
        type: SET_CURRENCIES,
        currencies
      });

      dispatch({ type: END_FETCH_CURRENCIES });
    } catch (error) {
      dispatch({ type: END_FETCH_CURRENCIES });
      throw error;
    }
  };
};

// Transaction action creators
export const categorizeRow = (rowId: string, categoryId: string) => {
  const rowCategoryMapping = { [rowId]: categoryId };
  return categorizeRows(rowCategoryMapping);
};

export const categorizeRows = (rowCategoryMapping: any): AppThunk<Promise<any>> => {
  return async (dispatch, getState) => {
    dispatch({
      type: CATEGORIZE_ROWS_START,
      rowCategoryMapping
    });
    
    const state = getState();
    const categorizerConfig = await updateCategorizer(
      state.transactions.data,
      state.transactions.categorizer.bayes,
      rowCategoryMapping
    );
    
    dispatch({
      type: CATEGORIZE_ROWS_END,
      rowCategoryMapping,
      categorizerConfig
    });
    
    // Return a promise to allow chaining
    return Promise.resolve(rowCategoryMapping);
  };
};

export const guessAllCategoriesStart = () => ({
  type: GUESS_ALL_CATEGORIES_START
});

export const guessAllCategoriesEnd = (transactionCategoryMapping: any, categorizerConfig: any) => ({
  type: GUESS_ALL_CATEGORIES_END,
  transactionCategoryMapping,
  categorizerConfig
});

export const guessAllCategories = (requireConfirmed = true): AppThunk<Promise<void>> => {
  return async (dispatch, getState) => {
    // Do not start guessing until the previous guessing is done.
    // Note: This can potentially queue up a lot of guessing, but in practice
    // this seems to be OK for now.
    while (getState().edit.isCategoryGuessing) {
      await sleep(100);
    }

    const state = getState();

    if (requireConfirmed) {
      // Determine the diversity of currently confirmed categories.
      // Do not start guessing if we have less than 3 confirmed categories.
      const confirmedCategories = new Set(
        state.transactions.data
          .filter((t: any) => !!t.category.confirmed)
          .map((t: any) => t.category.confirmed)
      );
      if (confirmedCategories.size < 3) return;
    }

    // Signal to everyone that we are starting the guessing game.
    dispatch(guessAllCategoriesStart());

    // If we don't have a classifier, train a new one
    let categorizerConfig = state.transactions.categorizer;
    if (!state.transactions.categorizer || !state.transactions.categorizer.bayes) {
      // XXX: This could potentially become very heavy if the training process
      // becomes complicated beyond bayes. It then might have to be trained
      // asynchronously or a message shown to the user.
      categorizerConfig = await retrainCategorizer(state.transactions.data);
    }

    // Guess 100 transactions at a time with a bit of sleeping in between to
    // avoid locking the UI completely.
    const transactionsToGuess = chunk(
      state.transactions.data.filter((t: any) => !t.category.confirmed),
      100
    );

    const transactionCategoryMapping: any = {};

    for (let i = 0; i < transactionsToGuess.length; i++) {
      const guessMapping = await guessCategory(
        transactionsToGuess[i],
        categorizerConfig
      );
      if (guessMapping) {
        for (const [key, value] of Object.entries(guessMapping)) {
          transactionCategoryMapping[key] = value;
        }
      }
      await sleep(10);
    }

    // Signal that we are done, and update all the guesses.
    dispatch(guessAllCategoriesEnd(transactionCategoryMapping, categorizerConfig));
  };
};

export const addCategory = (name: string, parentId: string = '') => ({
  type: 'ADD_CATEGORY',
  name: name,
  parentId
});

export const addCategoryWithRow = (name: string, parentId: string = '', rowId: string) => ({
  type: 'ADD_CATEGORY_WITH_ROW',
  categoryName: name,
  parentId,
  rowId
});

// More action creators
export const editDates = (dateSelectId: string, startDate: any, endDate: any) => ({
  type: EDIT_DATES,
  dateSelectId,
  startDate,
  endDate
});

export const setChartsBaseCurrency = (baseCurrency: string) => ({
  type: SET_CHARTS_BASE_CURRENCY,
  baseCurrency
});

export const setChartsGroupByParentCategory = (enabled: boolean) => ({
  type: SET_CHARTS_GROUP_BY_PARENT_CATEGORY,
  enabled
});

export const setChartsFilterCategories = (categoryIds: any) => ({
  type: SET_CHARTS_FILTER_CATEGORIES,
  categoryIds
});

export const setChartsCategorySorting = (sorting: any) => ({
  type: SET_CHARTS_CATEGORY_SORTING,
  sorting
});

export const fetchCurrencyRates = (currencies?: string[]): AppThunk<Promise<void>> => {
  return async (dispatch) => {
    dispatch({ type: START_FETCH_CURRENCY_RATES });

    try {
      let url = '/api/currencyRates';
      if (currencies && currencies.length > 0) {
        const params = currencies.map(c => `currencies=${c}`).join('&');
        url += `?${params}`;
      }

      const response = await fetch(url);
      const rates = await response.json();

      // Fill in missing dates with previous values
      const filledRates = fillMissingDates(rates);

      dispatch({
        type: SET_CURRENCY_RATES,
        currencyRates: filledRates
      });

      dispatch({ type: END_FETCH_CURRENCY_RATES });
    } catch (error) {
      dispatch({ type: END_FETCH_CURRENCY_RATES });
      throw error;
    }
  };
};

// Helper function to fill missing dates
const fillMissingDates = (rates: any) => {
  const dateKeys = Object.keys(rates).sort();
  if (dateKeys.length < 2) return rates;

  const filledRates = { ...rates };
  
  for (let i = 1; i < dateKeys.length; i++) {
    const currentDate = dateKeys[i];
    const prevDate = dateKeys[i - 1];
    
    // Calculate days between dates
    const current = new Date(currentDate);
    const prev = new Date(prevDate);
    const daysDiff = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    
    // Fill missing days
    for (let j = 1; j < daysDiff; j++) {
      const fillDate = new Date(prev);
      fillDate.setDate(fillDate.getDate() + j);
      const fillDateStr = fillDate.toISOString().split('T')[0];
      
      if (!filledRates[fillDateStr]) {
        filledRates[fillDateStr] = {
          ...rates[prevDate],
          refDate: prevDate
        };
      }
    }
  }
  
  return filledRates;
};

export const setEmptyTransactionsAccount = (accountId: string) => ({
  type: SET_EMPTY_TRANSACTIONS_ACCOUNT,
  accountId
});

// Transaction list actions
export const setTransactionListPage = (page: number) => ({
  type: 'SET_TRANSACTION_LIST_PAGE',
  page
});

export const setTransactionListPageSize = (pageSize: number, numTransactions: number) => ({
  type: 'SET_TRANSACTION_LIST_PAGE_SIZE',
  pageSize,
  numTransactions
});

export const setTransactionListSort = (sortKey: string, sortAscending: boolean) => ({
  type: 'SET_TRANSACTION_LIST_SORT',
  sortKey,
  sortAscending
});

export const setTransactionListFilterCategories = (filterCategories: any, numTransactions: number) => ({
  type: 'SET_TRANSACTION_LIST_FILTER_CATEGORIES',
  filterCategories,
  numTransactions
});

export const setTransactionListRoundAmount = (enabled: boolean) => ({
  type: 'SET_TRANSACTION_LIST_ROUND_AMOUNT',
  enabled
});

// Additional transaction actions

export const deleteTransaction = (rowId: string) => ({
  type: 'DELETE_TRANSACTION',
  transactionId: rowId
});

export const ignoreTransaction = (rowId: string, ignore: boolean) => ({
  type: 'IGNORE_TRANSACTION',
  transactionId: rowId,
  ignore
});

export const groupTransactions = (rowIds: string[]) => ({
  type: 'GROUP_TRANSACTIONS',
  rowIds
});

export const deleteTransactionGroup = (transactionGroupId: string) => ({
  type: 'DELETE_TRANSACTION_GROUP',
  transactionGroupId
});
