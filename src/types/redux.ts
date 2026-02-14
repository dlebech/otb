import { type ThunkAction, type ThunkDispatch } from 'redux-thunk';
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

// Redux thunk dispatch type
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;
