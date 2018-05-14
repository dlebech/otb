import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import * as actions from '../actions';

const initialCategories = {
  data: [
    { id: uuidv4(), name: 'Food' },
    { id: uuidv4(), name: 'Travel' }
  ]
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
    case actions.SET_PARENT_CATEGORY:
      const indexToSet = state.data.findIndex(c => c.id === action.categoryId);
      if (indexToSet < 0) return state;
      return update(state, {
        data: {
          [indexToSet]: {
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
    case actions.SET_IGNORE_CATEGORY:
      const indexToIgnore = state.data.findIndex(c => c.id === action.categoryId);
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

    default:
      return state;
  }
};

export default categoriesReducer;
