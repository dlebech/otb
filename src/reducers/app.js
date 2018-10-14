import update from 'immutability-helper';
import * as actions from '../actions';

const initialApp = {
  storage: {
    localStorage: false
  }
};

const appReducer = (state = initialApp, action) => {
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
    default:
      return state;
  }
};

export default appReducer;
