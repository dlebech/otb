import reducers from './reducers';
import * as actions from './actions';

it('should set default data', () => {
  const state = reducers({}, { type: 'NOOP' });
  expect(state.app).toEqual({
    isParsing: false
  });

  expect(state.transactions).toEqual({
    data: [],
    import: {
      data: [],
      skipRows: 0,
      columnSpec: []
    }
  });
});

it('should handle the parsing start action', () => {
  expect(reducers({}, actions.parseTransactionsStart()).app).toEqual({
    isParsing: true
  });
});

describe('import', () => {
  describe('transaction end', () => {
    it('should store transactions and guess column indexes', () => {
      const state = reducers({ app: { isParsing: true } }, actions.parseTransactionsEnd(null, [['2018-04-06', 'test row', 123, 456]]));
      expect(state.app.isParsing).toEqual(false);
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
      const state = reducers({ app: { isParsing: true } }, actions.parseTransactionsEnd(null, [[123, 'test row', 456, '2018-04-06']]));
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
    const state = reducers({}, actions.updateSkipRows(123));
    expect(state.transactions.import.skipRows).toEqual(123);
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
    }, actions.updateColumnType(1, 'description'));

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
    }, actions.cancelTransactions());

    expect(state.transactions.import).toEqual({
      data: [],
      skipRows: 0,
      columnSpec: []
    });
  });

  it('should handle save transaction action', () => {
    const state = reducers({
      transactions: {
        import: {
          data: [
            ['some', 'header', 'annoying', 'i know'],
            ['2018-04-06', 'test row', 123, 456]
          ],
          skipRows: 1,
          columnSpec: [
            { type: 'date' },
            { type: 'description' },
            { type: 'amount' },
            { type: 'total' }
          ]
        }
      }
    }, actions.saveTransactions());

    // Sets the data
    expect(state.transactions.data).toEqual([
      { 
        date: '2018-04-06',
        description: 'test row',
        amount: 123,
        total: 456
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