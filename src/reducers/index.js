import { combineReducers } from 'redux';
import { reducer as modalReducer } from 'redux-modal';
import { reducer as searchReducer } from 'redux-search';
import appReducer from './app';
import editReducer from './edit';
import accountsReducer from './accounts';
import transactionsReducer from './transactions';
import categoriesReducer from './categories';

export default combineReducers({
  app: appReducer,
  accounts: accountsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  modal: modalReducer,
  edit: editReducer,
  search: searchReducer
});
