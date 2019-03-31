import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import Transactions from './Transactions';

jest.mock('redux-modal', () => {
  return {
    connectModal: () => () => () => <span>YOLO</span>
  };
});

describe('Transactions', () => {
  const defaultData = {
    accounts: {
      data: []
    },
    transactions: {
      data: []
    },
    categories: {
      data: []
    },
    search: {
      transactions: {
        result: []
      }
    },
    edit: {
      dateSelect: {},
      transactionList: {
        filterCategories: new Set()
      }
    }
  };

  const mockStore = configureStore();

  it('should render nothing when there are no transactions', () => {
    const store = mockStore(defaultData);

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Transactions />
        </Provider>
      </MemoryRouter>
    );
    const rendered = container.render();
    expect(rendered.text()).toEqual('No data yet. Add some.');
    expect(rendered.find('a').text()).toEqual('Add some');
  });

  it('should show table when there are transactions, even when search is empty', () => {
    const store = mockStore(Object.assign({}, defaultData, {
      transactions: {
        data: [{ id: 'abcd', category: {}}]
      }
    }));

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Transactions />
        </Provider>
      </MemoryRouter>
    );

    // The check is performed by simply checking for the first button
    expect(container.render().find('a').text()).toEqual('Add More Transactions');
  });

  it('should render a table of transactions', () => {
    const store = mockStore({
      accounts: {
        data: []
      },
      transactions: {
        data: [
          {
            id: 'abcd',
            date: '2018-01-01',
            amount: 1,
            description: 'test',
            total: 2,
            category: {
              guess: '',
              confirmed: 'food'
            }
          }
        ]
      },
      categories: {
        data: [{ id: 'food', name: 'Food' }]
      },
      search: {
        transactions: {
          result: ['abcd']
        }
      },
      edit: {
        dateSelect: {},
        transactionList: {
          page: 1,
          pageSize: 50,
          filterCategories: new Set(),
          roundAmount: true
        }
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Transactions />
        </Provider>
      </MemoryRouter>
    );
    const rendered = container.render();
    expect(rendered.find('table').length).toEqual(1);

    const row = rendered.find('tr').eq(1);
    expect(row.find('td').eq(1).text()).toEqual('test');
    expect(row.find('td').eq(2).text()).toMatch('1');
    expect(row.find('td').eq(3).text()).toMatch('2');
    expect(row.find('td').eq(4).text()).toEqual('Food');
  });

  it('should show guess confirm and edit buttons', () => {
    const store = mockStore({
      accounts: {
        data: []
      },
      transactions: {
        data: [
          {
            id: 'abcd',
            date: '2018-01-01',
            amount: 1,
            description: 'test',
            total: 2,
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      },
      categories: {
        data: [{ id: 'travel', name: 'Travel' }]
      },
      search: {
        transactions: {
          result: ['abcd']
        }
      },
      edit: {
        dateSelect: {},
        transactionList: {
          page: 1,
          pageSize: 50,
          filterCategories: new Set()
        }
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Transactions />
        </Provider>
      </MemoryRouter>
    )
    const rendered = container.render();

    const categoryCol = rendered.find('tr').eq(1).find('td').eq(4);
    expect(categoryCol.find('svg').length).toEqual(3);
    expect(categoryCol.text()).toEqual('Travel');
  });

  it('should render a spinner when guessing categories', () => {
    const store = mockStore({
      accounts: {
        data: []
      },
      transactions: {
        data: [
          {
            id: 'abcd',
            date: '2018-01-01',
            amount: 1,
            description: 'test',
            total: 2,
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      },
      categories: {
        data: [{ id: 'travel', name: 'Travel' }]
      },
      search: {
        transactions: {
          result: ['abcd']
        }
      },
      edit: {
        dateSelect: {},
        isCategoryGuessing: true,
        transactionList: {
          filterCategories: new Set()
        }
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Transactions />
        </Provider>
      </MemoryRouter>
    );
    expect(container.render().find('.status').text()).toEqual('Guessing categories...');
  });
});