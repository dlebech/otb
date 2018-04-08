import { combineReducers } from 'redux';
import * as actions from './actions';
import update from 'immutability-helper';
import moment from 'moment';

const appReducer = (state = { isParsing: false }, action) => {
  switch (action.type) {
    case actions.PARSE_TRANSACTIONS_START:
      return update(state, {
        isParsing: { $set: true }
      });
    case actions.PARSE_TRANSACTIONS_END:
      return update(state, {
        isParsing: { $set: false }
      });
    default:
      return state;
  }
}

const initialTransactions = {
  import: {
    data: [],
    skipRows: 0,
    columnSpec: []
  },
  data: []
}

/**
 * Given a list of transactions (an array of arrays), guess which column
 * correspond to date, descriptions, etc.
 * @param {Array} transactions - A list of transactions
 */
const guessColumnSpec = transactions => {
  // Take the last transaction for now since there might be headers at the top.
  const transaction = transactions[transactions.length - 1];
  const columnSpec = transaction.map(t => ({ type: '' }));

  const hasColumnType = columnType => columnSpec.some(c => c.type === columnType);

  for (let i = 0; i < transaction.length; i++) {
    const val = transaction[i];
    // If the type is a string, use it as date or description.
    // If the type is a number, use as amount or total, depending on whether we
    // found one of these already.
    if (typeof val === 'string') {
      if (!hasColumnType('date') && moment(val).isValid()) columnSpec[i].type = 'date';
      else if (!hasColumnType('description')) columnSpec[i].type = 'description';
    } else if (typeof val === 'number') {
      if (!hasColumnType('amount')) columnSpec[i].type = 'amount';
      else columnSpec[i].type = 'total';
    }
  }

  return columnSpec;
};

const mapImportToTransactions = transactionsImport => {
  const dateIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'date');
  const descIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'description');
  const amountIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'amount');
  const totalIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'total');

  return transactionsImport.data
    .slice(transactionsImport.skipRows)
    .map(transaction => {
      return {
        date: transaction[dateIndex],
        description: transaction[descIndex],
        amount: transaction[amountIndex],
        total: transaction[totalIndex]
      };
    });
};

const transactionReducer = (state = initialTransactions, action) => {
  switch (action.type) {
    case actions.PARSE_TRANSACTIONS_END:
      return update(state, {
        import: {
          data: { $set: action.transactions },
          columnSpec: { $set: guessColumnSpec(action.transactions) }
        }
      });
    case actions.UPDATE_SKIP_ROWS:
      return update(state, {
        import: {
          skipRows: { $set: action.skipRows }
        }
      });
    case actions.UPDATE_COLUMN_TYPE:
      return update(state, {
        import: {
          columnSpec: {
            [action.columnIndex]: {
              type: {
                $set: action.columnType
              }
            }
          }
        }
      });
    case actions.CANCEL_TRANSACTIONS:
      return update(state, {
        import: {
          $set: initialTransactions.import
        }
      });
    case actions.SAVE_TRANSACTIONS:
      return update(state, {
        import: {
          $set: initialTransactions.import
        },
        data: {
          $set: mapImportToTransactions(state.import)
        }
      });
    default:
      return state;
  }
};

export default combineReducers({
  app: appReducer,
  transactions: transactionReducer
});
