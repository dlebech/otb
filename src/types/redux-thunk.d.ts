import { Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { RootState } from '../reducers';

// Declare types for Redux Thunk
declare module 'redux' {
  /**
   * Overload for useDispatch to handle thunks
   */
  export interface Dispatch<A extends Action = Action> {
    <R>(asyncAction: ThunkAction<R, RootState, unknown, A>): R;
  }
}

// Export the AppThunk type for use in action creators
export type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType>,
  RootState,
  unknown,
  Action<string>
>;

// Export the AppDispatch type for use with useDispatch
export type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
