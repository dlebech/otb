import update from 'immutability-helper';
import * as actions from '../actions';

const initialEditor = {
  dateSelect: {}
};

const editReducer = (state = initialEditor, action) => {
  switch (action.type) {
    case actions.EDIT_DATES:
      return update(state, {
        dateSelect: {
          [action.dateSelectId]: {
            $set: {
              startDate: action.startDate,
              endDate: action.endDate
            }
          }
        }
      });
    default:
      return state;
  }
};

export default editReducer;
