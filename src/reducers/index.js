import { combineReducers } from 'redux';
import { reducer as modalReducer } from 'redux-modal';
import appReducer from './app';
import editReducer from './edit';
import transactionsReducer from './transactions';
import categoriesReducer from './categories';

export default combineReducers({
  app: appReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  modal: modalReducer,
  edit: editReducer
});
