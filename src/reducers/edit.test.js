import reducers from './index';
import * as actions from '../actions';

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
