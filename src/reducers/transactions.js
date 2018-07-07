import update from 'immutability-helper';
import bayes from 'bayes';
import uuidv4 from 'uuid/v4';
import * as actions from '../actions';
import * as util from '../util';

const initialTransactions = {
  import: {
    data: [],
    skipRows: 0,
    columnSpec: []
  },
  data: [],
  categorizer: {
    // XXX: We're using the string representation of the bayes classifier here in
    // order to avoid introducing another state system (the classifer). However,
    // this might not perform very well in the long run, so it's probably a
    // decision that should be re-considered.
    bayes: ''
  }
}

const mapImportToTransactions = transactionsImport => {
  const dateIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'date');
  const descIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'description');
  const amountIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'amount');
  const totalIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'total');

  return transactionsImport.data
    .slice(transactionsImport.skipRows)
    .map(transaction => {
      return {
        id: uuidv4(),
        date: transaction[dateIndex],
        description: transaction[descIndex],
        amount: transaction[amountIndex],
        total: transaction[totalIndex],
        category: {
          guess: '',
          confirmed: ''
        }
      };
    });
};

const retrainBayes = transactions => {
  const classifier = bayes();
  transactions.forEach(t => {
    if (t.category.confirmed && t.description) {
      classifier.learn(t.description, t.category.confirmed);
    }
  });
  return classifier;
};

const transactionsReducer = (state = initialTransactions, action) => {
  switch (action.type) {
    case actions.PARSE_TRANSACTIONS_END:
      return update(state, {
        import: {
          data: { $set: action.transactions },
          columnSpec: { $set: util.guessColumnSpec(action.transactions) }
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
          $push: mapImportToTransactions(state.import)
        }
      });
    case actions.GUESS_CATEGORY_FOR_ROW:
      let rowsToGuess = action.rowId;
      if (!Array.isArray(rowsToGuess)) {
        rowsToGuess = [rowsToGuess];
      }
      const rowIndexes = rowsToGuess
        .map(rowId => state.data.findIndex(row => row.id === rowId))
        .filter(rowIndex => rowIndex >= 0);
      if (rowIndexes.length === 0) return state;
      if (!state.categorizer.bayes) return state;

      const guesstimator = bayes.fromJson(state.categorizer.bayes);

      let newState = state;
      rowIndexes.forEach(i => {
        const guess = guesstimator.categorize(newState.data[i].description);
        newState = update(newState, {
          data: {
            [i]: {
              category: {
                guess: {
                  $set: guess
                }
              }
            }
          }
        });
      });
      return newState;
    case actions.CATEGORIZE_ROW:
      const rowIndexCategorize = state.data.findIndex(row => row.id === action.rowId);
      if (rowIndexCategorize < 0) return state;
      // If there's currently no bayes classifier or if the category changed
      // from non-empty, create a new one.
      let classifier;
      if (state.categorizer.bayes && !state.data[rowIndexCategorize].category.confirmed) {
        classifier = bayes.fromJson(state.categorizer.bayes)
      } else {
        // Reset the classifier and re-train on all transactions, except the one
        // we are editing..
        classifier = retrainBayes(state.data.filter(t => t.id !== action.rowId));
      }

      // Train on the new category we are about to add
      if (action.categoryId && state.data[rowIndexCategorize].description) {
        classifier.learn(state.data[rowIndexCategorize].description, action.categoryId);
      }

      return update(state, {
        categorizer: {
          bayes: {
            $set: classifier.toJson()
          }
        },
        data: {
          [rowIndexCategorize]: {
            category: {
              confirmed: {
                $set: action.categoryId
              },
              $unset: ['guess']
            }
          }
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.transactions) return state;
      return update(state, {
        $set: action.newState.transactions
      });
    case actions.DELETE_CATEGORY:
      let retrain = false;
      for (let i = 0; i < state.data.length; i++) {
        const t = state.data[i];
        const unset = [];
        if (t.category.guess === action.categoryId) unset.push('guess');
        if (t.category.confirmed === action.categoryId) unset.push('confirmed');
        if (unset.length > 0) {
          retrain = true;
          state = update(state, {
            data: {
              [i]: {
                category: {
                  $unset: unset
                }
              }
            }
          });
        }
      }
      if (!retrain) return state;
      return update(state, {
        categorizer: {
          bayes: {
            $set: retrainBayes(state.data).toJson()
          }
        },
      });
    case actions.IGNORE_ROW:
      const indexToIgnore = state.data.findIndex(c => c.id === action.rowId);
      if (indexToIgnore < 0) return state;
      const op = action.ignore ? {
        ignore: {
          $set: true
        }
      } : {
        $unset: ['ignore']
      }
      return update(state, {
        data: {
          [indexToIgnore]: op
        }
      });
    case actions.DELETE_ROW:
      const indexToDelete = state.data.findIndex(c => c.id === action.rowId);
      if (indexToDelete < 0) return state;
      return update(state, {
        data: {
          $splice: [[indexToDelete, 1]]
        }
      });
    case actions.CREATE_TEST_DATA:
      return update(state, {
        data: {
          $set: util.createTestData()
        }
      });
    default:
      return state;
  }
};

export default transactionsReducer;
