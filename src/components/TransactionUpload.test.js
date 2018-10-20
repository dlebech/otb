import React from 'react';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import update from 'immutability-helper';
import * as actions from '../actions';
import TransactionUpload from './TransactionUpload';
import { defaultAccount } from '../data/accounts';

describe('Transaction Upload', () => {
  const mockStore = configureStore();

  const baseData = {
    transactions: {
      import: {
        data: [
          ['Date', 'Description', 'Amount', 'Total'],
          ['2018-01-01', 'Cool stuff', 123, 456]
        ],
        skipRows: 1,
        columnSpec: [
          { type: 'date'},
          { type: 'description'},
          { type: 'amount'},
          { type: 'total'}
        ],
        dateFormat: ''
      }
    },
    accounts: {
      data: [defaultAccount]
    }
  };

  it('should save the uploaded data', () => {
    const store = mockStore(baseData);

    const container = mount(
      <MemoryRouter>
        <TransactionUpload store={store} />
      </MemoryRouter>
    );

    // Replace the history push function with a mock.
    // This is not documented anywhere, so it might break...
    const push = jest.fn();
    container.instance().history.push = push;

    // Call the save function
    const uploadWrapper = container.find('TransactionUpload').first();
    uploadWrapper.instance().handleSave();

    // Should dispatch
    expect(store.getActions()).toEqual([
      { type: actions.IMPORT_SAVE_TRANSACTIONS }
    ]);

    expect(push).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/transactions');
  });

  describe('error validation', () => {
    it('should require some column specs like date and amount', () => {
      const data = update(baseData, {
        transactions: {
          import: {
            columnSpec: {
              0: {
                type: {
                  $set: ''
                }
              }
            }
          }
        }
      });
      const store = mockStore(data);

      const container = mount(
        <MemoryRouter>
          <TransactionUpload store={store} />
        </MemoryRouter>
      );

      // Call the save function
      const uploadWrapper = container.find('TransactionUpload').first();
      uploadWrapper.instance().handleSave();

      // Should not dispatch
      expect(store.getActions()).toEqual([]);

      uploadWrapper.update();

      expect(uploadWrapper.state()).toEqual({
        errors: [
          {
            type: 'columnSpec',
            message: 'Please select a date column'
          },
        ]
      });
    });

    it('should complain if all amounts cannot be parsed', () => {
      const data = update(baseData, {
        transactions: {
          import: {
            data: {
              1: {
                2: {
                  $set: 'n/a'
                }
              }
            }
          }
        }
      });
      const store = mockStore(data);

      const container = mount(
        <MemoryRouter>
          <TransactionUpload store={store} />
        </MemoryRouter>
      );

      // Call the save function
      const uploadWrapper = container.find('TransactionUpload').first();
      uploadWrapper.instance().handleSave();

      // Should not dispatch
      expect(store.getActions()).toEqual([]);

      uploadWrapper.update();

      expect(uploadWrapper.state()).toEqual({
        errors: [
          {
            type: 'amount',
            message: 'Cannot parse all amounts as numbers, perhaps you need to skip a header?'
          }
        ]
      });
    });

    it('should complain if all dates cannot be parsed', () => {
      const data = update(baseData, {
        transactions: {
          import: {
            data: {
              1: {
                0: {
                  $set: 'n/a'
                }
              }
            }
          }
        }
      });
      const store = mockStore(data);

      const container = mount(
        <MemoryRouter>
          <TransactionUpload store={store} />
        </MemoryRouter>
      );

      // Call the save function
      const uploadWrapper = container.find('TransactionUpload').first();
      uploadWrapper.instance().handleSave();

      // Should not dispatch
      expect(store.getActions()).toEqual([]);

      uploadWrapper.update();

      expect(uploadWrapper.state()).toEqual({
        errors: [
          {
            type: 'date',
            message: 'Cannot parse all dates correctly, ' +
              'perhaps you need to skip a header, or change the date format?'
          }
        ]
      });
    });
  });
});