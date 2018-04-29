import React from 'react';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Transactions from './Transactions';

describe('Transactions', () => {
  const mockStore = configureStore();

  it('should render nothing when there are no transactions', () => {
    const store = mockStore({
      transactions: {
        data: []
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Transactions store={store} />
      </MemoryRouter>
    );
    expect(container.render().text()).toEqual('No data yet. Add some.');
  });

  it('should render a table of transactions', () => {
    const store = mockStore({
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
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Transactions store={store} />
      </MemoryRouter>
    ).render();
    expect(container.find('table').length).toEqual(1);

    const row = container.find('tr').eq(1);
    expect(row.find('td').eq(0).text()).toEqual('2018-01-01');
    expect(row.find('td').eq(1).text()).toEqual('test');
    expect(row.find('td').eq(2).text()).toEqual('1');
    expect(row.find('td').eq(3).text()).toEqual('2');
    expect(row.find('td').eq(4).text()).toEqual('food');
  });
});