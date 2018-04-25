export const PARSE_TRANSACTIONS_START = 'PARSE_TRANSACTIONS_START';
export const PARSE_TRANSACTIONS_END = 'PARSE_TRANSACTIONS_END';
export const SAVE_TRANSACTIONS = 'SAVE_TRANSACTIONS';
export const CANCEL_TRANSACTIONS = 'CANCEL_TRANSACTIONS';
export const UPDATE_SKIP_ROWS = 'UPDATE_SKIP_ROWS';
export const UPDATE_COLUMN_TYPE = 'UPDATE_COLUMN_TYPE';
export const GUESS_CATEGORY_FOR_ROW = 'GUESS_CATEGORY_FOR_ROW';
export const CATEGORIZE_ROW = 'CATEGORIZE_ROW';

export const parseTransactionsStart = () => {
  return {
    type: PARSE_TRANSACTIONS_START
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

export const categorizeRow = (rowId, category) => {
  return {
    type: CATEGORIZE_ROW,
    rowId,
    category
  };
};
