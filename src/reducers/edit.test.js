import reducers from './index';
import * as actions from '../actions';

it('should add categories being edited', () => {
  const state = reducers({}, actions.editCategoryForRow('a'));
  expect(state.edit.transactionCategories.has('a')).toBeTruthy();
  expect(state.edit.transactionCategories.has('b')).toBeFalsy();
});

it('should clear categories being edited', () => {
  const state = reducers({
    edit: {
      transactionCategories: new Set(['a', 'b'])
    }
  }, actions.guessCategoryForRow('b'));

  expect(state.edit.transactionCategories.size).toEqual(0);
});