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

it('should set the date selection for the given dates', () => {
  const state = reducers({
    edit: {
      dateSelect: {}
    }
  }, actions.editDates('a', '2018-01-01', '2018-01-02'));

  // The rest of their state is managed internally
  expect(state.edit.dateSelect['a']).toEqual({
    startDate: '2018-01-01',
    endDate: '2018-01-02'
  });
});
