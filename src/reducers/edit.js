import update from 'immutability-helper';
import * as actions from '../actions';

const initialEditor = {
  transactionCategories: new Set(),
  dateSelect: {}
};

const editReducer = (state = initialEditor, action) => {
  switch (action.type) {
    case actions.EDIT_CATEGORY_FOR_ROW:
      let rowsToAdd = action.rowId;
      if (!Array.isArray(rowsToAdd)) {
        rowsToAdd = [rowsToAdd];
      }
      return update(state, {
        transactionCategories: {
          $add: rowsToAdd
        }
      });
    case actions.GUESS_CATEGORY_FOR_ROW:
    case actions.CATEGORIZE_ROW:
      // Remove all editing categories when guessing and categorizing.
      return update(state, {
        transactionCategories: {
          $remove: Array.from(state.transactionCategories)
        }
      });
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
