import reducers from './index';
import * as actions from '../actions';

jest.mock('uuid/v4', () => {
  return jest.fn(() => 'abcd');
});

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.accounts).toEqual({
    data: [
      { id: 'abcd', name: 'Default Account' }
    ]
  });
});

it('should add a new account', () => {
  const state = reducers({}, actions.addAccount('Another account', 'USD'));

  expect(state.accounts.data).toContainEqual({
    id: 'abcd',
    name: 'Another account',
  });
});

it('should change an existing account', () => {
  const state = reducers({}, actions.updateAccount('abcd', 'New Name', 'DKK'));
  expect(state.accounts.data).toContainEqual({
    id: 'abcd',
    name: 'New Name',
    currency: 'DKK'
  });
});

it('should delete an account ', () => {
  const state = reducers({}, actions.deleteAccount('abcd'));
  expect(state.accounts.data).toEqual([]);
});