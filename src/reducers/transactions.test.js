import reducers from './index';
import * as actions from '../actions';

jest.mock('uuid', () => {
  return {
    v4: () => 'abcd'
  };
});

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.transactions).toEqual({
    version: 1,
    data: [],
    import: {
      data: [],
      skipRows: 0,
      skipDuplicates: true,
      columnSpec: [],
      dateFormat: ''
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
      const state = reducers({}, actions.importParseTransactionsEnd([['2018-04-06', 'test row', 123, 456]]));
      expect(state.transactions.import).toEqual({
        data: [['2018-04-06', 'test row', 123, 456]],
        skipRows: 0,
        skipDuplicates: true,
        columnSpec: [
          { type: 'date' },
          { type: 'description' },
          { type: 'amount' },
          { type: 'total' }
        ],
        dateFormat: 'YYYY-MM-DD'
      });
    });

    it('should guess different date formats', () => {
      const state = reducers({}, actions.importParseTransactionsEnd([['06.04.2018', 'test row', 123, 456]]));
      expect(state.transactions.import).toEqual({
        data: [['06.04.2018', 'test row', 123, 456]],
        skipRows: 0,
        skipDuplicates: true,
        columnSpec: [
          { type: 'date' },
          { type: 'description' },
          { type: 'amount' },
          { type: 'total' }
        ],
        dateFormat: 'DD-MM-YYYY'
      });
    });

    it('should handle columns in different positions', () => {
      const state = reducers({}, actions.importParseTransactionsEnd([[123, 'test row', 456, '2018-04-06']]));
      expect(state.transactions.import).toEqual({
        data: [[123, 'test row', 456, '2018-04-06']],
        skipRows: 0,
        skipDuplicates: true,
        columnSpec: [
          { type: 'amount' },
          { type: 'description' },
          { type: 'total' },
          { type: 'date' }
        ],
        dateFormat: 'YYYY-MM-DD'
      });
    });

    it('should handle string amounts', () => {
      const state = reducers({}, actions.importParseTransactionsEnd([['1 234', 'test row', '4,568', '2018-04-06']]));
      expect(state.transactions.import).toEqual({
        data: [['1 234', 'test row', '4,568', '2018-04-06']],
        skipRows: 0,
        skipDuplicates: true,
        columnSpec: [
          { type: 'amount' },
          { type: 'description' },
          { type: 'total' },
          { type: 'date' }
        ],
        dateFormat: 'YYYY-MM-DD'
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

  it('should handle set date format action', () => {
    const state = reducers({}, actions.importSetDateFormat('YYYY-MM-DD'));
    expect(state.transactions.import.dateFormat).toEqual('YYYY-MM-DD');
  });

  it('should handle set skip duplicates action', () => {
    const state = reducers({}, actions.importSetSkipDuplicates(true));
    expect(state.transactions.import.skipDuplicates).toEqual(true);
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
          columnSpec: [{ type: '' }, { type: '' }],
          skipDuplicates: false
        }
      }
    }, actions.importCancelTransactions());

    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      skipDuplicates: true,
      columnSpec: [],
      dateFormat: ''
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
            ['2018-04-06', 'test row 2', '123,456.78', '456,789.01'],
            ['2018-04-06', 'test row 3', '123.456,78', '140,45']
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
      },
      {
        id: 'abcd',
        date: '2018-04-06',
        description: 'test row 3',
        descriptionCleaned: 'test row 3',
        amount: 123456.78,
        total: 140.45,
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
      skipDuplicates: true,
      columnSpec: [],
      dateFormat: ''
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
            ['07/04/2018', 'test row 2', 123, 246]
          ],
          skipRows: 0,
          columnSpec: [
            { type: 'date' },
            { type: 'description' },
            { type: 'amount' },
            { type: 'total' }
          ],
          dateFormat: 'DD-MM-YYYY'
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
      skipDuplicates: true,
      columnSpec: [],
      dateFormat: ''
    });
  });

  it('should skip duplicate rows', () => {
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
            ['06/04/2018', 'test row', 123, 123]
          ],
          skipRows: 0,
          skipDuplicates: true,
          columnSpec: [
            { type: 'date' },
            { type: 'description' },
            { type: 'amount' },
            { type: 'total' }
          ],
          dateFormat: 'DD-MM-YYYY'
        }
      }
    }, actions.importSaveTransactions());

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
      }
    ]);
  });
});

describe('categorizeRowEnd', () => {
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
    }, actions.categorizeRowEnd({ abcd: 'hobby' }, { bayes: '{}' }));

    expect(state.transactions.categorizer.bayes).toEqual('{}');
    expect(state.transactions.data[0].category).toEqual({
      confirmed: 'hobby'
    });
  });

});

it('should restore from file', () => {
  const state = reducers({}, actions.restoreStateFromFile({
    transactions: {
      version: 1,
      data: [{ id: 'abcd' }]
    }
  }));

  expect(state.transactions.data).toEqual([
    { id: 'abcd' }
  ])
});

it('should reset categories when a category is removed', () => {
  const state = reducers({
    transactions: {
      version: 1,
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
  }, actions.deleteCategoryStart('food'));

  expect(state.transactions.data[0].category).toEqual({ confirmed: '' });
  expect(state.transactions.data[1].category).toEqual({ guess: '' });
  expect(state.transactions.data[2].category).toEqual({
    guess: '',
    confirmed: 'hobby'
  });
});

it('should set a new categorizer when a category is done being deleted', () => {
  const state = reducers({
    transactions: {
      version: 1,
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
  }, actions.deleteCategoryEnd('food', { bayes: '{}' }));
  expect(state.transactions.categorizer.bayes).toEqual('{}');
});

it('should set a transaction to ignored', () => {
  let state = reducers({
    transactions: {
      version: 1,
      data: [
        { id: 'abcd' }
      ]
    }
  }, actions.ignoreTransaction('abcd', true));
  expect(state.transactions.data).toContainEqual({
    id: 'abcd',
    ignore: true
  });

  state = reducers(state, actions.ignoreTransaction('abcd', false));
  expect(state.transactions.data).toContainEqual({
    id: 'abcd'
  });
});

it('should delete a transaction', () => {
  const state = reducers({
    transactions: {
      version: 1,
      data: [
        { id: 'abcd' }
      ]
    }

  }, actions.deleteTransaction('abcd'));
  expect(state.transactions.data).toEqual([]);
});

describe('Transaction grouping', () => {
  it('should not update groups if there are not enough IDs', () => {
    const state = reducers({
      transactions: {
        version: 1,
        data: [
          { id: 'abcd' },
          { id: 'efgh' }
        ],
        groups: {}
      }

    }, actions.groupTransactions(['abcd']));

    expect(state.transactions.groups).toEqual({});
  });

  it('should group transactions according to dates', () => {
    const state = reducers({
      transactions: {
        version: 1,
        data: [
          { id: 'abcd', date: '2018-01-02' },
          { id: 'efgh', date: '2018-01-01' }
        ]
      }
    }, actions.groupTransactions(['abcd', 'efgh']));

    expect(state.transactions.groups).toEqual({
      'abcd_efgh': {
        primaryId: 'efgh',
        linkedIds: ['abcd'],
      }
    });
  });

  it('should not add subset groups', () => {
    const state = reducers({
      transactions: {
        version: 1,
        data: [
          { id: 'abcd', date: '2018-01-02' },
          { id: 'efgh', date: '2018-01-01' },
          { id: 'ijkl', date: '2018-01-03' }
        ],
        groups: {
          'abcd_efgh_ijkl': {
            primaryId: 'efgh',
            linkedIds: ['abcd', 'ijkl']
          }
        }
      }

    }, actions.groupTransactions(['abcd', 'ijkl']));

    expect(state.transactions.groups).toEqual({
      'abcd_efgh_ijkl': {
        primaryId: 'efgh',
        linkedIds: ['abcd', 'ijkl']
      }
    });
  });

  it('should delete a group', () => {
    const state = reducers({
      transactions: {
        version: 1,
        groups: {
          'abcd_efgh_ijkl': {}
        }
      }

    }, actions.deleteTransactionGroup('abcd_efgh_ijkl'));

    expect(state.transactions.groups).toEqual({});
  });
});

it('should create test data', () => {
  const state = reducers({}, actions.createTestData());
  expect(state.transactions.data.length).toBeGreaterThan(100);
  expect(state.transactions.data[0].total).toBeGreaterThan(state.transactions.data[1].total);
  expect(state.transactions.data[0].account).toBeDefined();
});

it('should update empty account fields', () => {
  const state = reducers({
    transactions: {
      version: 1,
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