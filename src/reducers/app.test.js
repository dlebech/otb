import reducers from './index';
import * as actions from '../actions';

// Using the global reducer make default data nicer.

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.app).toEqual({
    isParsing: false,
    isCategoryGuessing: false,
    storage: {
      localStorage: false 
    },
  });
});

it('should handle the parsing start action', () => {
  expect(reducers({}, actions.parseTransactionsStart()).app.isParsing).toEqual(true);
});

it('should handle the toggle persist action', () => {
  expect(reducers({}, actions.toggleLocalStorage(true)).app.storage).toEqual({
    localStorage: true
  });

  expect(reducers({}, actions.toggleLocalStorage(false)).app.storage).toEqual({
    localStorage: false
  });
});

it('should set parsing to false on parse transaction ending', () => {
  const state = reducers({ app: { isParsing: true } }, actions.parseTransactionsEnd(null, [['2018-04-06', 'test row', 123, 456]]));
  expect(state.app.isParsing).toEqual(false);
});

it('should handle the guess start action', () => {
  expect(reducers({}, actions.startGuessAllCategories()).app.isCategoryGuessing).toEqual(true);
});

it('should handle the guess end action', () => {
  expect(reducers({ app: { isCategoryGuessing: true } }, actions.endGuessAllCategories()).app.isCategoryGuessing).toEqual(false);
});