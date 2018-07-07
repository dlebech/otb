import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './actions';

const mockStore = configureStore([thunk]);

it('should dispatch and add category and categorize row', async () => {
  // Mock store does not call any reducers, so adding the category is done to fake the adding of the category.
  // The add category functionality itself is tested in the reducer tests.
  const store = mockStore({
    categories: {
      data: [{ id: 'abcd', name: 'Hobby' }]
    }
  });

  store.dispatch(actions.addCategoryWithRow('Hobby', '', 'efgh'));

  expect(store.getActions()).toEqual([
    {
      type: actions.ADD_CATEGORY,
      name: 'Hobby',
      parentId: ''
    },
    {
      type: actions.CATEGORIZE_ROW,
      categoryId: 'abcd',
      rowId: 'efgh'
    },
  ]);
});