import reducers from './index';
import * as actions from '../actions';

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.app).toEqual({
    storage: {
      localStorage: false 
    }
  });
});

it('should handle the toggle persist action', () => {
  expect(reducers({}, actions.toggleLocalStorage(true)).app.storage).toEqual({
    localStorage: true
  });

  expect(reducers({}, actions.toggleLocalStorage(false)).app.storage).toEqual({
    localStorage: false
  });
});

it('should handle create test mode action', () => {
  expect(reducers({}, actions.createTestData()).app.isTestMode).toEqual(true);
});