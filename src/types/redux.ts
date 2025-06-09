import { type ThunkAction } from 'redux-thunk';
import { type UnknownAction } from 'redux';
import { type RootState } from '../reducers';

// Re-export types from app.ts and data for easier importing
export { type Account } from '../data/accounts';
export { type Category } from '../data/categories';
export { type Transaction } from './app';

// Redux thunk action type
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;
