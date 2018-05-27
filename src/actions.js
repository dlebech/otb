export const PARSE_TRANSACTIONS_START = 'PARSE_TRANSACTIONS_START';
export const PARSE_TRANSACTIONS_END = 'PARSE_TRANSACTIONS_END';
export const TOGGLE_LOCAL_STORAGE = 'TOGGLE_LOCAL_STORAGE';
export const SAVE_TRANSACTIONS = 'SAVE_TRANSACTIONS';
export const CANCEL_TRANSACTIONS = 'CANCEL_TRANSACTIONS';
export const UPDATE_SKIP_ROWS = 'UPDATE_SKIP_ROWS';
export const UPDATE_COLUMN_TYPE = 'UPDATE_COLUMN_TYPE';
export const GUESS_CATEGORY_FOR_ROW = 'GUESS_CATEGORY_FOR_ROW';
export const EDIT_CATEGORY_FOR_ROW = 'EDIT_CATEGORY_FOR_ROW';
export const CATEGORIZE_ROW = 'CATEGORIZE_ROW';
export const IGNORE_ROW = 'IGNORE_ROW';
export const DELETE_ROW = 'DELETE_ROW';
export const RESTORE_STATE_FROM_FILE = 'RESTORE_STATE_FROM_FILE';
export const ADD_CATEGORY = 'ADD_CATEGORY';
export const UPDATE_CATEGORY = 'UPDATE_CATEGORY';
export const DELETE_CATEGORY = 'DELETE_CATEGORY';
export const EDIT_DATES = 'EDIT_DATES';

export const parseTransactionsStart = () => {
  return {
    type: PARSE_TRANSACTIONS_START
  };
};

export const toggleLocalStorage = enabled => {
  return {
    type: TOGGLE_LOCAL_STORAGE,
    enabled
  };
};

export const parseTransactionsEnd = (error, transactions) => {
  return {
    type: PARSE_TRANSACTIONS_END,
    transactions
  };
};

export const updateSkipRows = skipRows => {
  return {
    type: UPDATE_SKIP_ROWS,
    skipRows
  };
};

export const updateColumnType = (columnIndex, columnType) => {
  return {
    type: UPDATE_COLUMN_TYPE,
    columnIndex,
    columnType
  };
};

export const saveTransactions = () => {
  return {
    type: SAVE_TRANSACTIONS
  };
};

export const cancelTransactions = () => {
  return {
    type: CANCEL_TRANSACTIONS
  };
};

export const guessCategoryForRow = rowId => {
  return {
    type: GUESS_CATEGORY_FOR_ROW,
    rowId
  };
};

export const editCategoryForRow = rowId => {
  return {
    type: EDIT_CATEGORY_FOR_ROW,
    rowId
  };
};

export const categorizeRow = (rowId, category) => {
  return {
    type: CATEGORIZE_ROW,
    rowId,
    category
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
