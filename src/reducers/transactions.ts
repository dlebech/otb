import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import * as actions from '../actions';
import * as util from '../util';
import { uncategorized } from '../data/categories';
import { AnyAction } from 'redux';
import {
  type Transaction,
  type TransactionImport,
  type TransactionGroup,
  type TransactionsState
} from '../types/app';

const initialTransactions: TransactionsState = {
  version: 1,
  import: {
    data: [],
    skipRows: 0,
    skipDuplicates: true,
    columnSpec: [],
    dateFormat: ''
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

const mapImportToTransactions = (transactionsImport: TransactionImport, existingTransactions: Transaction[]): Transaction[] => {
  const dateIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'date');
  const descIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'description');
  const amountIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'amount');
  const totalIndex = transactionsImport.columnSpec.findIndex(spec => spec.type === 'total');

  // If the import is set to skip duplicates make a set of strings with the
  // primary attributes of all existing transactions (date, description, amount,
  // total) and check the new transactions against that set. This will work best
  // if the "total" column has valid amounts, as that should definitely
  // determine the order of transactions on a bank statement.
  let filter: (t: Transaction) => boolean = () => true;
  if (transactionsImport.skipDuplicates) {
    const mapTransaction = (t: Transaction) => `${t.date}_${t.description}_${t.amount}_${t.total}`;
    const bagOfTransactions = new Set(existingTransactions.map(mapTransaction));
    filter = (t: Transaction) => !bagOfTransactions.has(mapTransaction(t));
  }

  return transactionsImport.data
    .slice(transactionsImport.skipRows)
    .map(transaction => {
      return {
        id: uuidv4(),
        // Normalize dates to ISO format
        date: util
          .momentParse(transaction[dateIndex], transactionsImport.dateFormat)
          .format('YYYY-MM-DD'),
        description: transaction[descIndex],
        descriptionCleaned: util.cleanTransactionDescription(transaction[descIndex]),
        amount: util.cleanNumber(transaction[amountIndex]),
        total: util.cleanNumber(transaction[totalIndex]),
        account: transactionsImport.account,
        category: {
          guess: '',
          confirmed: ''
        }
      };
    })
    .filter(filter);
};

const v1Migration = (state: TransactionsState): TransactionsState => {
  if (!state.data) return state;

  const newTransactions = state.data.map(t => {
    return update(t, {
      $apply: (obj: Transaction) => {
        return update(obj, {
          descriptionCleaned: {
            $set: util.cleanTransactionDescription(obj.description)
          }
        });
      }
    });
  });

  return update(state, {
    version: {
      $set: 1
    },
    data: {
      $set: newTransactions
    }
  });
};

const migrations = [v1Migration];

const migrate = (state: TransactionsState): TransactionsState => {
  for (let i = state.version || 0; i < migrations.length; i++) {
    state = migrations[i](state);
  }
  return state;
};

const transactionsReducer = (state = initialTransactions, action: AnyAction): TransactionsState => {
  // Perform migrations first.
  // Note: Also do migrations after restoring a file!
  state = migrate(state);

  switch (action.type) {
    case actions.IMPORT_PARSE_TRANSACTIONS_END:
      if (action.data.length === 0) return state;
      const [columnSpec, dateFormat] = util.guessColumnSpec(action.data);
      console.debug('Guessed column spec:', columnSpec);
      console.debug('Guessed date format:', dateFormat);
      return update(state, {
        import: {
          data: { $set: action.data },
          columnSpec: { $set: columnSpec },
          dateFormat: { $set: dateFormat }
        }
      });
    case actions.IMPORT_UPDATE_SKIP_ROWS:
      return update(state, {
        import: {
          skipRows: { $set: action.skipRows }
        }
      });
    case actions.IMPORT_UPDATE_COLUMN_TYPE:
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
    case actions.IMPORT_UPDATE_ACCOUNT:
      return update(state, {
        import: {
          account: { $set: action.accountId }
        }
      });
    case actions.IMPORT_SET_DATE_FORMAT:
      return update(state, {
        import: {
          dateFormat: { $set: action.dateFormat }
        }
      });
    case actions.IMPORT_SET_SKIP_DUPLICATES:
      return update(state, {
        import: {
          skipDuplicates: { $set: action.enabled }
        }
      });
    case actions.IMPORT_CANCEL_TRANSACTIONS:
      return update(state, {
        import: {
          $set: initialTransactions.import
        }
      });
    case actions.IMPORT_SAVE_TRANSACTIONS:
      return update(state, {
        import: {
          $set: initialTransactions.import
        },
        data: {
          $push: mapImportToTransactions(state.import, state.data)
        }
      });
    case actions.GUESS_ALL_CATEGORIES_END:
      const lookup = util.reverseIndexLookup(state.data);
      Object.keys(action.transactionCategoryMapping).forEach(key => {
        state = update(state, {
          data: {
            [lookup[key]]: {
              category: {
                guess: {
                  $set: action.transactionCategoryMapping[key]
                }
              }
            }
          }
        });
      });
      return update(state, {
        categorizer: {
          $set: action.categorizerConfig
        }
      });
    case actions.CATEGORIZE_ROW_END:
      const lookup2 = util.reverseIndexLookup(state.data);
      Object.keys(action.transactionCategoryMapping).forEach(key => {
        state = update(state, {
          data: {
            [lookup2[key]]: {
              category: {
                confirmed: {
                  $set: action.transactionCategoryMapping[key]
                },
                $unset: ['guess']
              }
            }
          }
        });
      });
      return update(state, {
        categorizer: {
          $set: action.categorizerConfig
        }
      });
    case actions.CATEGORIZE_ROWS_START:
      // Handle start of bulk categorization - could be used for loading states
      return state;
    case actions.CATEGORIZE_ROWS_END:
      const lookup3 = util.reverseIndexLookup(state.data);
      Object.keys(action.rowCategoryMapping).forEach(transactionId => {
        const categoryId = action.rowCategoryMapping[transactionId];
        if (lookup3[transactionId] !== undefined) {
          if (categoryId && categoryId !== uncategorized.id) {
            // Set confirmed category and remove guess
            state = update(state, {
              data: {
                [lookup3[transactionId]]: {
                  category: {
                    confirmed: {
                      $set: categoryId
                    },
                    $unset: ['guess']
                  }
                }
              }
            });
          } else {
            // Clear both confirmed and guess categories (empty string means clear)
            state = update(state, {
              data: {
                [lookup3[transactionId]]: {
                  category: {
                    $unset: ['confirmed', 'guess']
                  }
                }
              }
            });
          }
        }
      });
      return update(state, {
        categorizer: {
          $set: action.categorizerConfig
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.transactions) return state;
      state = update(state, {
        $set: action.newState.transactions
      });
      return migrate(state);
    case actions.DELETE_CATEGORY_START:
      for (let i = 0; i < state.data.length; i++) {
        const t = state.data[i];
        const unset: string[] = [];
        if (t.category.guess === action.categoryId) unset.push('guess');
        if (t.category.confirmed === action.categoryId) unset.push('confirmed');
        if (unset.length > 0) {
          state = update(state, {
            data: {
              [i]: {
                category: {
                  $unset: unset
                }
              }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          });
        }
      }
      return state;
    case actions.DELETE_CATEGORY_END:
      return update(state, {
        categorizer: {
          $set: action.categorizerConfig
        }
      });
    case actions.IGNORE_TRANSACTION:
      const indexToIgnore = state.data.findIndex(c => c.id === action.transactionId);
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
    case actions.DELETE_TRANSACTION:
      const indexToDelete = state.data.findIndex(c => c.id === action.transactionId);
      if (indexToDelete < 0) return state;
      return update(state, {
        data: {
          $splice: [[indexToDelete, 1]]
        }
      });
    case actions.GROUP_TRANSACTIONS:
      if (action.transactionIds.length <= 1) return state;

      if (!state.groups) {
        state = update(state, {
          groups: {
            $set: {}
          }
        });
      }

      const transactionSet = new Set(action.transactionIds);
      const hasGroupOverlap = Object
        .keys(state.groups || {})
        .map(key => key.split('_')) // An array of arrays
        .reduce((prev, cur) => {    // A flattened array
          return [...prev, ...cur];
        }, [] as string[])
        .find(transactionId => transactionSet.has(transactionId));

      if (hasGroupOverlap) return state;

      const orderedTransactionIds = ([] as Transaction[])
        .concat(state.data.filter(t => transactionSet.has(t.id)))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(t => t.id);

      // The group ID should always be ordered according to the contained
      // transactions.
      const groupId = [...orderedTransactionIds].sort().join('_');

      const group: TransactionGroup = {
        primaryId: orderedTransactionIds[0],
        linkedIds: orderedTransactionIds.slice(1)
      };

      return update(state, {
        groups: {
          [groupId]: {
            $set: group
          }
        }
      });
    case actions.DELETE_TRANSACTION_GROUP:
      return update(state, {
        groups: {
          $unset: [action.transactionGroupId]
        }
      });
    case actions.CREATE_TEST_DATA:
      const testTransactions = util.createTestData();
      return update(state, {
        data: {
          $set: testTransactions
        }
      });
    case actions.EXIT_TEST_MODE:
      return update(state, {
        $set: initialTransactions
      });
    case actions.SET_EMPTY_TRANSACTIONS_ACCOUNT:
      for (let i = 0; i < state.data.length; i++) {
        const t = state.data[i];
        if (!!t.account) continue;
        state = update(state, {
          data: {
            [i]: {
              account: {
                $set: action.accountId
              }
            }
          }
        });
      }
      return state;
    default:
      return state;
  }
};

export default transactionsReducer;
