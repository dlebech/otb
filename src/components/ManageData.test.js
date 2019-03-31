import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import ManageData from './ManageData';
import { defaultAccount } from '../data/accounts';
import * as actions from '../actions';

jest.mock('redux-modal', () => {
  return {
    connectModal: () => () => () => <span>YOLO</span>
  };
});

describe('Manage Data', () => {
  const mockStore = configureStore();

  const defaultStore = () => {
    return {
      edit: {
        isCategoryGuessing: false,
      },
      accounts: {
        data: [defaultAccount]
      },
      transactions: {
        data: []
      },
      categories: {
        data: []
      }
    };
  };

  describe('account warning', () => {
    it('should show a transactions without accounts warning', () => {
      const storeData = defaultStore();
      storeData.transactions.data.push({ id: 'a', category: {} });
      const store = mockStore(storeData);

      const container = shallow(
        <div>
          <Provider store={store}>
            <ManageData />
          </Provider>
        </div>
      );
      const rendered = container.render();
      expect(rendered.text()).toEqual(
        expect.stringContaining('Transactions without an account: 1')
      );
    });

    it('should not show a transactions without accounts warning', () => {
      const storeData = defaultStore();
      storeData.transactions.data.push({ id: 'a', category: {}, account: 'abcd' });
      const store = mockStore(storeData);

      const container = shallow(
        <div>
          <Provider store={store}>
            <ManageData />
          </Provider>
        </div>
      );
      const rendered = container.render();
      expect(rendered.text()).not.toEqual(
        expect.stringContaining('Transactions without an account: 1')
      );
    });

    it('should update all transactions with an account', () => {
      const storeData = defaultStore();
      storeData.transactions.data.push({ id: 'a', category: {} });
      const store = mockStore(storeData);

      const container = mount(
        <div>
          <Provider store={store}>
            <ManageData />
          </Provider>
        </div>
      );

      const btn = container.find('button#set-account-on-transactions').first();
      btn.simulate('click');
      expect(store.getActions()).toEqual([
        { type: actions.SET_EMPTY_TRANSACTIONS_ACCOUNT, accountId: defaultAccount.id }
      ]);
    });
  });
});