import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './actions';

const mockStore = configureStore([thunk]);

it('should dispatch and add category and categorize row', () => {
  // Mock store does not call any reducers, so adding the category is done to
  // fake the adding of the category. The add category functionality itself is
  // tested in the reducer tests.
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

describe('fetchCurrencies', () => {
  afterEach(() => fetch.resetMocks());

  it('should fetch and set currencies', async () => {
    const store = mockStore({});
    fetch.once(JSON.stringify(['USD', 'JPY']));

    await store.dispatch(actions.fetchCurrencies());

    expect(store.getActions()).toEqual([
      {
        type: actions.START_FETCH_CURRENCIES
      },
      {
        type: actions.SET_CURRENCIES,
        currencies: ['USD', 'JPY']
      },
      {
        type: actions.END_FETCH_CURRENCIES
      },
    ]);
  });
});

describe('fetchCurrencyRates', () => {
  afterEach(() => fetch.resetMocks());

  it('should fetch and set currency rates', async () => {
    const store = mockStore({});
    const rates = {
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      }
    };
    fetch.once(JSON.stringify(rates));

    await store.dispatch(actions.fetchCurrencyRates());

    expect(store.getActions()).toEqual([
      {
        type: actions.START_FETCH_CURRENCIES
      },
      {
        type: actions.SET_CURRENCY_RATES,
        currencyRates: rates
      },
      {
        type: actions.END_FETCH_CURRENCIES
      },
    ]);
  });
});