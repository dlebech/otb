import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import * as actions from '../actions';
import defaultCategories from '../data/categories';

const initialCategories = {
  data: [].concat(defaultCategories).sort((a, b) => a.name.localeCompare(b.name))
};

const categoriesReducer = (state = initialCategories, action) => {
  switch (action.type) {
    case actions.ADD_CATEGORY:
      return update(state, {
        data: {
          $push: [{
            id: uuidv4(),
            name: action.name,
            parent: action.parentId
          }]
        }
      });
    case actions.UPDATE_CATEGORY:
      const indexToUpdate = state.data.findIndex(c => c.id === action.categoryId);
      if (indexToUpdate < 0) return state;
      return update(state, {
        data: {
          [indexToUpdate]: {
            name: {
              $set: action.name
            },
            parent: {
              $set: action.parentId || ''
            }
          }
        }
      });
    case actions.DELETE_CATEGORY:
      const indexToDelete = state.data.findIndex(c => c.id === action.categoryId);
      if (indexToDelete < 0) return state;
      return update(state, {
        data: {
          $splice: [[indexToDelete, 1]]
        }
      });
    default:
      return state;
  }
};

export default categoriesReducer;
