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

const mockDownloadJs = jest.fn(() => '');
jest.mock('downloadjs', () => {
  return mockDownloadJs;
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
        data: [
          { id: 'food', name: 'Food & Drink'},
          { id: 'groceries', name: 'Groceries', parent: 'food'}
        ]
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

  describe('download csv', () => {
    const baseTransaction = () => ({
      id: 'a',
      date: '2020-01-01',
      description: 'yep !',
      descriptionCleaned: 'yep',
      amount: 123,
      total: 456,
      category: {}
    });

    afterEach(() => {
      mockDownloadJs.mockClear();
    });

    it('should download a csv without category and account', async () => {
      const storeData = defaultStore();
      storeData.transactions.data.push(baseTransaction());
      const store = mockStore(storeData);

      const container = mount(
        <Provider store={store}>
          <ManageData />
        </Provider>
      );

      const blobSpy = jest
        .spyOn(global, 'Blob')
        .mockImplementationOnce(() => ({}));

      // Call the handleCsvDownload function
      const wrapper = container.find('ManageData').first();
      await wrapper.instance().handleCsvDownload();

      expect(mockDownloadJs).toHaveBeenCalled();
      expect(mockDownloadJs.mock.calls.length).toBe(1);
      expect(mockDownloadJs.mock.calls[0][1]).toBe('transactions.csv');
      expect(mockDownloadJs.mock.calls[0][2]).toBe('text/csv');

      let fileContents = 'transaction_id,date,description,description_cleaned,amount,total,category_id,category_name,account_id,account_name,account_currency';
      fileContents += '\r\n'; // Default papaparse newline delimiters
      fileContents += 'a,2020-01-01,yep !,yep,123,456,,,,,';
      expect(blobSpy).toHaveBeenCalled();
      expect(blobSpy).toHaveBeenCalledWith([fileContents], { type: 'text/csv' });
    })

    it('should download a csv withcategory and account', async () => {
      const storeData = defaultStore();
      const t1 = baseTransaction();
      const t2 = baseTransaction();
      t1.category = { confirmed: 'food' };
      t1.account = defaultAccount.id;
      t2.id = 'b';
      t2.date = '2020-01-02';
      t2.category = { confirmed: 'groceries' };
      storeData.transactions.data.push(t1);
      storeData.transactions.data.push(t2);
      const store = mockStore(storeData);

      const container = mount(
        <Provider store={store}>
          <ManageData />
        </Provider>
      );

      const blobSpy = jest
        .spyOn(global, 'Blob')
        .mockImplementationOnce(() => ({}));

      // Call the handleCsvDownload function
      const wrapper = container.find('ManageData').first();
      await wrapper.instance().handleCsvDownload();

      expect(mockDownloadJs).toHaveBeenCalled();
      expect(mockDownloadJs.mock.calls.length).toBe(1);
      expect(mockDownloadJs.mock.calls[0][1]).toBe('transactions.csv');
      expect(mockDownloadJs.mock.calls[0][2]).toBe('text/csv');

      let fileContents = 'transaction_id,date,description,description_cleaned,amount,total,category_id,category_name,account_id,account_name,account_currency';
      fileContents += '\r\n'; // Default papaparse newline delimiters
      fileContents += `a,2020-01-01,yep !,yep,123,456,food,Food & Drink,${defaultAccount.id},${defaultAccount.name},`;
      fileContents += '\r\n'; // Default papaparse newline delimiters
      fileContents += 'b,2020-01-02,yep !,yep,123,456,groceries,Food & Drink > Groceries,,,';
      expect(blobSpy).toHaveBeenCalled();
      expect(blobSpy).toHaveBeenCalledWith([fileContents], { type: 'text/csv' });
    })
  });
});