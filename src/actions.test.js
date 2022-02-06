import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './actions';

const mockStore = configureStore([thunk]);

describe('addCategoryWithRow', () => {
  it('should dispatch and add category and categorize row', async () => {
    // Mock store does not call any reducers
    const store = mockStore({
      categories: {
        data: [{ id: 'abcd', name: 'Hobby' }]
      },
      transactions: {
        data: [{ id: 'efgh', category: {}, descriptionCleaned: 'works nicely' }],
        categorizer: {
          bayes: ''
        },
      }
    });

    await store.dispatch(actions.addCategoryWithRow('Hobby', '', 'efgh'));

    const calledActions = store.getActions();

    // The category is added and row categorization starts.

    expect(calledActions[0]).toEqual({
      type: actions.ADD_CATEGORY,
      name: 'Hobby',
      parentId: ''
    })

    expect(calledActions[1]).toEqual({
      type: actions.CATEGORIZE_ROW_START,
    });

    expect(calledActions[2].type).toEqual(actions.CATEGORIZE_ROW_END);
    expect(calledActions[2].transactionCategoryMapping).toEqual({
      'efgh': 'abcd'
    });

    expect(calledActions[2].categorizerConfig).toBeTruthy();
  });
});

describe('fetchCurrencies', () => {
  beforeEach(() => fetch.resetMocks());
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
  beforeEach(() => fetch.resetMocks());
  afterEach(() => fetch.resetMocks());

  it('should fetch and set currency rates', async () => {
    const store = mockStore({ edit: {} });
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
        type: actions.START_FETCH_CURRENCY_RATES
      },
      {
        type: actions.SET_CURRENCY_RATES,
        currencyRates: rates
      },
      {
        type: actions.END_FETCH_CURRENCY_RATES
      },
    ]);
  });

  it('should fetch specific currencies', async () => {
    const store = mockStore({ edit: {} });
    const rates = {
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      }
    };
    fetch.once(JSON.stringify(rates));

    await store.dispatch(actions.fetchCurrencyRates(['DKK', 'SEK']));

    expect(fetch.mock.calls.length).toEqual(1);
    expect(String(fetch.mock.calls[0][0]))
      .toEqual('http://localhost/.netlify/functions/currencyRates?currencies=DKK&currencies=SEK');

    expect(store.getActions()).toEqual([
      {
        type: actions.START_FETCH_CURRENCY_RATES
      },
      {
        type: actions.SET_CURRENCY_RATES,
        currencyRates: rates
      },
      {
        type: actions.END_FETCH_CURRENCY_RATES
      },
    ]);
  });

  it('should fill currencies for blank dates', async () => {
    const store = mockStore({ edit: {} });
    const rates = {
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      },
      '2018-01-03': {
        DKK: 8.5,
        SEK: 10.5
      }
    };
    fetch.once(JSON.stringify(rates));

    await store.dispatch(actions.fetchCurrencyRates());

    expect(store.getActions()).toEqual([
      {
        type: actions.START_FETCH_CURRENCY_RATES
      },
      {
        type: actions.SET_CURRENCY_RATES,
        currencyRates: Object.assign({}, rates, {
          '2018-01-02': {
            DKK: 7.5,
            SEK: 9.5,
            refDate: '2018-01-01'
          }
        })
      },
      {
        type: actions.END_FETCH_CURRENCY_RATES
      },
    ]);
  });
});

describe('guessAllCategories', () => {
  const baseData = {
    edit: {
      isCategoryGuessing: false,
    },
    transactions: {
      categorizer: {
        // A bayes classifier, trained on apple and origami
        bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
      },
      data: [
        {
          id: 'a',
          descriptionCleaned: 'more origami',
          category: {
            guess: '',
            confirmed: ''
          }
        },
        {
          id: 'b',
          descriptionCleaned: 'more origami',
          category: {
            guess: '',
            confirmed: 'hobby' // Already classified
          }
        },
        {
          id: 'c',
          descriptionCleaned: 'apple apple',
          category: {
            guess: '',
            confirmed: ''
          }
        }
      ]
    }
  };

  it('should require some confirmed categories by default', async () => {
    const store = mockStore(baseData);
    await store.dispatch(actions.guessAllCategories());
    expect(store.getActions()).toEqual([]);
  })

  it('should guess the categories', async () => {
    const store = mockStore(baseData);

    await store.dispatch(actions.guessAllCategories(false));
    const calledActions = store.getActions();

    expect(calledActions[0]).toEqual({
      type: actions.GUESS_ALL_CATEGORIES_START
    });

    expect(calledActions[1].type).toEqual(actions.GUESS_ALL_CATEGORIES_END);
    expect(calledActions[1].transactionCategoryMapping).toEqual({
      'a': 'hobby',
      'c': 'food'
    });
  });
});

describe('categorizeRow', () => {
  it('should add a confirmed category to the classifier', async () => {
    const store = mockStore({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            description: 'origami',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    });

    await store.dispatch(actions.categorizeRow('abcd', 'hobby'));

    const calledActions = store.getActions();

    // The category is added and row categorization starts.

    expect(calledActions[0]).toEqual({
      type: actions.CATEGORIZE_ROW_START,
    });

    expect(calledActions[1].type).toEqual(actions.CATEGORIZE_ROW_END);
    expect(calledActions[1].transactionCategoryMapping).toEqual({
      'abcd': 'hobby'
    });

    expect(calledActions[1].categorizerConfig.bayes).toEqual(
      // Expecting it to be trained on one row now :-)
      '{"categories":{"hobby":true},"docCount":{"hobby":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"hobby":1},"wordFrequencyCount":{"hobby":{"origami":1}},"options":{}}'
    );
  });

  it('should retrain the classifier when a category changes', async () => {
    const store = mockStore({
      transactions: {
        categorizer: {
          bayes: '{"categories":{"hobby":true},"docCount":{"hobby":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"hobby":1},"wordFrequencyCount":{"hobby":{"origami":1}},"options":{}}'
        },
        data: [
          {
            id: 'abcd',
            description: 'origami',
            category: {
              confirmed: 'hobby'
            }
          }
        ]
      }
    });

    await store.dispatch(actions.categorizeRow('abcd', 'food'));
    const calledActions = store.getActions();

    expect(calledActions[1].categorizerConfig.bayes).toEqual(
      // Expecting it to not know about hobby anymore because origami is now food for some reason.
      '{"categories":{"food":true},"docCount":{"food":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"food":1},"wordFrequencyCount":{"food":{"origami":1}},"options":{}}'
    );
  });

  it('should not add empty categories to classifier', async () => {
    const store = mockStore({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            description: 'origami',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    });

    await store.dispatch(actions.categorizeRow('abcd', ''));
    const calledActions = store.getActions();

    // Expect and empty classifier because the category is empty.
    expect(calledActions[1].categorizerConfig.bayes).toEqual(
      '{"categories":{},"docCount":{},"totalDocuments":0,"vocabulary":{},"vocabularySize":0,"wordCount":{},"wordFrequencyCount":{},"options":{}}'
    );
  });

  it('should not add empty descriptions to classifier', async () => {
    const store = mockStore({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            description: '',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    });

    await store.dispatch(actions.categorizeRow('abcd', 'hobby'));
    const calledActions = store.getActions();

    // Expect and empty classifier because the category is empty.
    expect(calledActions[1].categorizerConfig.bayes).toEqual(
      '{"categories":{},"docCount":{},"totalDocuments":0,"vocabulary":{},"vocabularySize":0,"wordCount":{},"wordFrequencyCount":{},"options":{}}'
    );
  });
});

describe('categorizeRows', () => {
  const baseData = {
    transactions: {
      categorizer: {
        bayes: ''
      },
      data: [
        {
          id: 'abcd',
          description: 'origami',
          descriptionCleaned: 'origami',
          category: {
            guess: 'travel',
            confirmed: ''
          }
        },
        {
          id: 'efgh',
          description: 'hotel',
          category: {
            guess: 'travel',
            confirmed: ''
          }
        }
      ]
    }
  };

  it('should add a confirmed category to multiple rows', async () => {
    const store = mockStore(baseData);

    await store.dispatch(actions.categorizeRows({
      abcd: 'hobby',
      efgh: 'travel'
    }));
    const calledActions = store.getActions();

    // Expect and empty classifier because the category is empty.
    expect(calledActions[1].transactionCategoryMapping).toEqual({
      abcd: 'hobby',
      efgh: 'travel'
    });

    expect(calledActions[1].categorizerConfig.bayes).toEqual(
      '{"categories":{"hobby":true,"travel":true},"docCount":{"hobby":1,"travel":1},"totalDocuments":2,"vocabulary":{"origami":true,"hotel":true},"vocabularySize":2,"wordCount":{"hobby":1,"travel":1},"wordFrequencyCount":{"hobby":{"origami":1},"travel":{"hotel":1}},"options":{}}'
    );
  });
});

describe('deleteCategory', () => {
  it('should reset categories and retrain categorizer when a category is removed', async () => {
    const store = mockStore({
      transactions: {
        categorizer: {
          // trained on apple and origami
          bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
        },
        data: [
          {
            category: {
              guess: 'food',
              confirmed: ''
            }
          },
          {
            description: 'apple',
            descriptionCleaned: 'apple',
            category: {
              guess: '',
              confirmed: 'food'
            }
          },
          {
            description: 'origami',
            descriptionCleaned: 'origami',
            category: {
              guess: '',
              confirmed: 'hobby'
            }
          }
        ]
      }
    });

    await store.dispatch(actions.deleteCategory('food'));

    const calledActions = store.getActions();

    expect(calledActions[0]).toEqual({
      type: actions.DELETE_CATEGORY_START,
      categoryId: 'food'
    });

    expect(calledActions[1]).toEqual({
      type: actions.DELETE_CATEGORY_END,
      categoryId: 'food',
      categorizerConfig: {
        // Expecting it to be trained only on hobby now
        bayes: '{"categories":{"hobby":true},"docCount":{"hobby":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"hobby":1},"wordFrequencyCount":{"hobby":{"origami":1}},"options":{}}'
      }
    });
  });
});