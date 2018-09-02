import update from 'immutability-helper';
import * as actions from '../actions';

const initialApp = {
  isParsing: false,
  isCategoryGuessing: false,
  storage: {
    localStorage: false
  }
};

const appReducer = (state = initialApp, action) => {
  switch (action.type) {
    case actions.PARSE_TRANSACTIONS_START:
      return update(state, {
        isParsing: { $set: true }
      });
    case actions.PARSE_TRANSACTIONS_END:
      return update(state, {
        isParsing: { $set: false }
      });
    case actions.TOGGLE_LOCAL_STORAGE:
      return update(state, {
        storage: {
          localStorage: {
            $set: action.enabled
          }
        }
      });
    case actions.RESTORE_STATE_FROM_FILE:
      if (!action.newState.app) return state;
      return update(state, {
        $set: action.newState.app
      });
    case actions.START_GUESS_ALL_CATEGORIES:
      return update(state, {
        isCategoryGuessing: { $set: true }
      });
    case actions.END_GUESS_ALL_CATEGORIES:
      return update(state, {
        isCategoryGuessing: { $set: false }
      });
    case actions.SET_DEFAULT_CURRENCY:
      return update(state, {
        defaultCurrency: {
          $set: action.currency
        }
      });
    default:
      return state;
  }
};

export default appReducer;
