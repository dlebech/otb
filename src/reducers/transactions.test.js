import reducers from './index';
import * as actions from '../actions';

jest.mock('uuid/v4', () => {
  return jest.fn(() => 'abcd');
});

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.transactions).toEqual({
    version: 1,
    data: [],
    import: {
      data: [],
      skipRows: 0,
      columnSpec: []
    },
    categorizer: {
      bayes: ''
    }
  });
});

describe('migrations', () => {
  it('should perform v1 migration (description update)', () => {
    const state = reducers({
      transactions: {
        data: [
          { description: 'This is 123456 cool' },
          { description: '2018-01-01 Also cool' }
        ]
      }
    }, { type: 'NOOP' });

    expect(state.transactions).toEqual({
      version: 1,
      data: [
        { description: 'This is 123456 cool', descriptionCleaned: 'this is cool' },
        { description: '2018-01-01 Also cool', descriptionCleaned: 'also cool' }
      ]
    });
  });

  it('should not perform upgrade when the version is correct', () => {
    // This is kind of dependent on the above functionality working.
    const state = reducers({
      transactions: {
        version: 1, // This is fake just to trick the migrater.
        data: [
          { description: 'This is 123456 cool' },
          { description: '2018-01-01 Also cool' }
        ]
      }
    }, { type: 'NOOP' });

    expect(state.transactions).toEqual({
      version: 1,
      data: [
        // Description remains unchanged
        { description: 'This is 123456 cool' },
        { description: '2018-01-01 Also cool' }
      ]
    });
  });
});

describe('import', () => {
  describe('transaction end', () => {
    it('should store transactions and guess column indexes', () => {
      const state = reducers({}, actions.importParseTransactionsEnd(null, [['2018-04-06', 'test row', 123, 456]]));
      expect(state.transactions.import).toEqual({
        data: [['2018-04-06', 'test row', 123, 456]],
        skipRows: 0,
        columnSpec: [
          { type: 'date' },
          { type: 'description' },
          { type: 'amount' },
          { type: 'total' }
        ]
      });
    });

    it('should handle columns in different positions', () => {
      const state = reducers({}, actions.importParseTransactionsEnd(null, [[123, 'test row', 456, '2018-04-06']]));
      expect(state.transactions.import).toEqual({
        data: [[123, 'test row', 456, '2018-04-06']],
        skipRows: 0,
        columnSpec: [
          { type: 'amount' },
          { type: 'description' },
          { type: 'total' },
          { type: 'date' }
        ]
      });
    });
  });

  it('should handle skip rows action', () => {
    const state = reducers({}, actions.importUpdateSkipRows(123));
    expect(state.transactions.import.skipRows).toEqual(123);
  });

  it('should handle set account name action', () => {
    const state = reducers({}, actions.importUpdateAccount('abcd'));
    expect(state.transactions.import.account).toEqual('abcd');
  });

  it('should handle column type updates', () => {
    const state = reducers({
      transactions: {
        import: {
          data: [],
          skipRows: 0,
          columnSpec: [{ type: '' }, { type: '' }]
        }
      }
    }, actions.importUpdateColumnType(1, 'description'));

    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: [{ type: '' }, { type: 'description' }]
    });
  });

  it('should handle cancel transaction action', () => {
    const state = reducers({
      transactions: {
        import: {
          data: [[0, 1]],
          skipRows: 0,
          columnSpec: [{ type: '' }, { type: '' }]
        }
      }
    }, actions.importCancelTransactions());

    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: []
    });
  });

  it('should handle save transaction action', () => {
    const state = reducers({
      transactions: {
        data: [],
        import: {
          data: [
            ['some', 'header', 'annoying', 'i know'],
            ['2018-04-06', 'test row', 123, 456],
            ['2018-04-06', 'test row 2', '123,456.78', '456,789.01']
          ],
          skipRows: 1,
          columnSpec: [
            { type: 'date' },
            { type: 'description' },
            { type: 'amount' },
            { type: 'total' }
          ],
          account: 'abcd'
        }
      }
    }, actions.importSaveTransactions());

    // Sets the data
    expect(state.transactions.data).toEqual([
      {
        id: 'abcd',
        date: '2018-04-06',
        description: 'test row',
        descriptionCleaned: 'test row',
        amount: 123,
        total: 456,
        account: 'abcd',
        category: {
          guess: '',
          confirmed: ''
        }
      },
      {
        id: 'abcd',
        date: '2018-04-06',
        description: 'test row 2',
        descriptionCleaned: 'test row 2',
        amount: 123456.78,
        total: 456789.01,
        account: 'abcd',
        category: {
          guess: '',
          confirmed: ''
        }
      }
    ]);

    // Resets the import
    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: []
    });
  });

  it('should append import to existing transactions', () => {
    const state = reducers({
      transactions: {
        data: [{
          id: 'abcd',
          date: '2018-04-06',
          description: 'test row',
          descriptionCleaned: 'test row',
          amount: 123,
          total: 123,
          category: {
            guess: '',
            confirmed: ''
          }
        }],
        import: {
          data: [
            ['2018-04-07', 'test row 2', 123, 246]
          ],
          skipRows: 0,
          columnSpec: [
            { type: 'date' },
            { type: 'description' },
            { type: 'amount' },
            { type: 'total' }
          ]
        }
      }
    }, actions.importSaveTransactions());

    // Sets the data
    expect(state.transactions.data).toEqual([
      {
        id: 'abcd',
        date: '2018-04-06',
        description: 'test row',
        descriptionCleaned: 'test row',
        amount: 123,
        total: 123,
        category: {
          guess: '',
          confirmed: ''
        }
      },
      {
        id: 'abcd',
        date: '2018-04-07',
        description: 'test row 2',
        descriptionCleaned: 'test row 2',
        amount: 123,
        total: 246,
        category: {
          guess: '',
          confirmed: ''
        }
      }
    ]);

    // Resets the import
    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: []
    });
  });
});

describe('guess category', () => {
  it('should guess the category of a single row', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          // A bayes classifier, trained on apple and origami
          bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
        },
        data: [
          {
            id: 'abcd',
            date: '2018-04-06',
            description: 'more origami',
            amount: 123,
            total: 456,
            category: {
              guess: '',
              confirmed: ''
            }
          }
        ]
      }
    }, actions.guessCategoryForRow('abcd'));

    // Sets the data
    expect(state.transactions.data[0].category).toEqual({
      guess: 'hobby',
      confirmed: ''
    });
  });

  it('should guess the category of a multiple rows', () => {
    const state = reducers({
      transactions: {
        categorizer: {
          // A bayes classifier, trained on apple and origami
          bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
        },
        data: [
          {
            id: 'a',
            description: 'more origami',
            category: {}
          },
          {
            id: 'b',
            description: 'more origami yet',
            category: {}
          },
          {
            id: 'c',
            description: 'so much origami',
            category: {}
          }
        ]
      }
    }, actions.guessCategoryForRow(['a', 'b', 'ok']));

    // Sets the data
    expect(state.transactions.data[0].category).toEqual({
      guess: 'hobby'
    });
    expect(state.transactions.data[1].category).toEqual({
      guess: 'hobby'
    });
    expect(state.transactions.data[2].category).toEqual({});
  });

  it('should add a confirmed category to the classifier', () => {
    const state = reducers({
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
    }, actions.categorizeRow('abcd', 'hobby'));

    expect(state.transactions.categorizer.bayes).toEqual(
      // Expecting it to be trained on one row now :-)
      '{"categories":{"hobby":true},"docCount":{"hobby":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"hobby":1},"wordFrequencyCount":{"hobby":{"origami":1}},"options":{}}'
    );

    // Sets the data
    expect(state.transactions.data[0].category).toEqual({
      confirmed: 'hobby'
    });
  });

  it('should retrain the classifier when a category changes', () => {
    const state = reducers({
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
    }, actions.categorizeRow('abcd', 'food'));

    expect(state.transactions.categorizer.bayes).toEqual(
      // Expecting it to not know about hobby anymore because origami is now food for some reason.
      '{"categories":{"food":true},"docCount":{"food":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"food":1},"wordFrequencyCount":{"food":{"origami":1}},"options":{}}'
    );
  });

  it('should not add empty categories to classifier', () => {
    const state = reducers({
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
    }, actions.categorizeRow('abcd', ''));

    // Expect and empty classifier because the category is empty.
    expect(state.transactions.categorizer.bayes).toEqual(
      '{"categories":{},"docCount":{},"totalDocuments":0,"vocabulary":{},"vocabularySize":0,"wordCount":{},"wordFrequencyCount":{},"options":{}}'
    );
  });

  it('should not add empty descriptions to classifier', () => {
    const state = reducers({
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
    }, actions.categorizeRow('abcd', 'hobby'));

    // Expect and empty classifier because the category is empty.
    expect(state.transactions.categorizer.bayes).toEqual(
      '{"categories":{},"docCount":{},"totalDocuments":0,"vocabulary":{},"vocabularySize":0,"wordCount":{},"wordFrequencyCount":{},"options":{}}'
    );
  });
});

it('should restore from file', () => {
  const state = reducers({}, actions.restoreStateFromFile({
    transactions: {
      data: [{ id: 'abcd' }]
    }
  }));

  expect(state.transactions.data).toEqual([
    { id: 'abcd' }
  ])
});

it('should reset categories and retrain categorizer when a category is removed', () => {
  const state = reducers({
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
          category: {
            guess: '',
            confirmed: 'food'
          }
        },
        {
          description: 'origami',
          category: {
            guess: '',
            confirmed: 'hobby'
          }
        }
      ]
    }
  }, actions.deleteCategory('food'));

  expect(state.transactions.data[0].category).toEqual({ confirmed: '' });
  expect(state.transactions.data[1].category).toEqual({ guess: '' });
  expect(state.transactions.data[2].category).toEqual({
    guess: '',
    confirmed: 'hobby'
  });

  expect(state.transactions.categorizer.bayes).toEqual(
    // Expecting it to be trained only on hobby now
    '{"categories":{"hobby":true},"docCount":{"hobby":1},"totalDocuments":1,"vocabulary":{"origami":true},"vocabularySize":1,"wordCount":{"hobby":1},"wordFrequencyCount":{"hobby":{"origami":1}},"options":{}}'
  );
});

it('should set a transaction to ignored', () => {
  let state = reducers({
    transactions: {
      data: [
        { id: 'abcd' }
      ]
    }
  }, actions.ignoreRow('abcd', true));
  expect(state.transactions.data).toContainEqual({
    id: 'abcd',
    ignore: true
  });

  state = reducers(state, actions.ignoreRow('abcd', false));
  expect(state.transactions.data).toContainEqual({
    id: 'abcd'
  });
});

it('should delete a transaction', () => {
  const state = reducers({
    transactions: {
      data: [
        { id: 'abcd' }
      ]
    }
  }, actions.deleteRow('abcd'));
  expect(state.transactions.data).toEqual([]);
});

it('should create test data', () => {
  const state = reducers({}, actions.createTestData());
  expect(state.transactions.data.length).toBeGreaterThan(100);
  expect(state.transactions.data[0].total).toBeGreaterThan(state.transactions.data[1].total);
  expect(state.transactions.data[0].account).toBeDefined();
  expect(state.transactions.categorizer.bayes.length).toBeGreaterThan(0);
});

it('should update empty account fields', () => {
  const state = reducers({
    transactions: {
      data: [
        { id: 'a', account: 'c' },
        { id: 'b' }
      ]
    }
  }, actions.setEmptyTransactionsAccount('d'));
  expect(state.transactions.data).toEqual([
    { id: 'a', account: 'c' },
    { id: 'b', account: 'd' }
  ]);
});