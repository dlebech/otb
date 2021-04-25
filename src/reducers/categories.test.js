import reducers from './index';
import * as actions from '../actions';

jest.mock('uuid', () => {
  return {
    v4: () => 'abcd'
  };
});

it('should add a new category', () => {
  const state = reducers({}, actions.addCategory('Lodging', ''));

  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'Lodging',
    parent: ''
  });
});

it('should change the name of a category', () => {
  const state = reducers({}, actions.updateCategory('abcd', 'New Name', 'efgh'));
  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'New Name',
    parent: 'efgh'
  });
});

it('should not update the name for an unknon a category ID', () => {
  const state = reducers({}, actions.updateCategory('doesnotexist', 'New Name'));
  expect(state.categories.data).not.toContainEqual({
    id: 'abcd',
    name: 'New Name',
    parent: ''
  });
});

it('should delete a category', () => {
  const state = reducers({}, actions.deleteCategoryStart('abcd'));
  // They all have the same ID in these tests, but it will delete the first one,
  // which is Bar currently (because of sorting)
  expect(state.categories.data).not.toContainEqual({
    id: 'abcd',
    name: 'Account Transfers',
    parent: 'abcd'
  });
  expect(state.categories.data).toContainEqual({
    id: 'abcd',
    name: 'Shopping',
  });
});

it('should restore from file', () => {
  const state = reducers({}, actions.restoreStateFromFile({
    categories: {
      data: [{ id: 'abcd', name: 'Hobby' }]
    }
  }));

  expect(state.categories.data).toEqual([
    { id: 'abcd', name: 'Hobby' }
  ])
});
