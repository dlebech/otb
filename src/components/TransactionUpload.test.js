import React from 'react';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import * as actions from '../actions';
import TransactionUpload from './TransactionUpload';
import { defaultAccount } from '../data/accounts';

describe('Transaction Upload', () => {
  const mockStore = configureStore();

  it('should save the uploaded data', () => {
    const store = mockStore({
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
    });

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
});