import update from 'immutability-helper';
import * as actions from '../actions';
import { AnyAction } from 'redux';
import { type AppState } from '../types/app';

const initialApp: AppState = {
  storage: {
    localStorage: false
  }
};

const appReducer = (state = initialApp, action: AnyAction): AppState => {
  switch (action.type) {
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
    case actions.CREATE_TEST_DATA:
      return update(state, {
        isTestMode: {
          $set: true
        }
      });
    case actions.EXIT_TEST_MODE:
      return update(state, {
        $set: initialApp
      });
    default:
      return state;
  }
};

export default appReducer;
