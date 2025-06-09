import { combineReducers } from 'redux';
import { reducer as searchReducer } from 'redux-search';
import appReducer from './app';
import editReducer from './edit';
import accountsReducer from './accounts';
import transactionsReducer from './transactions';
import categoriesReducer from './categories';

const rootReducer = combineReducers({
  app: appReducer,
  accounts: accountsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  edit: editReducer,
  search: searchReducer
});

export default rootReducer;

// Export types for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
