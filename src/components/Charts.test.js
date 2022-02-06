import React from 'react';
import moment from 'moment';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Charts from './Charts';
import * as actions from '../actions';

describe('Chart', () => {
  const mockStore = configureStore([thunk]);

  const baseData = {
    transactions: {
      data: [
        {
          date: '2018-01-01',
          amount: -1,
          category: {
            confirmed: 'b'
          },
          account: 'a'
        },
        {
          date: '2018-01-01',
          amount: -2,
          category: {
            confirmed: 'b'
          },
          account: 'b'
        },
        {
          date: '2018-01-02',
          amount: 3,
          category: {},
          account: 'a'
        }
      ]
    },
    categories: {
      data: [
        {
          id: 'a',
          name: 'Food'
        },
        {
          id: 'b',
          name: 'Groceries',
          parent: 'a'
        }
      ]
    },
    edit: {
      charts: {},
      dateSelect: {
        'chart-dates': {
          startDate: moment('2017-12-31'),
          endDate: moment('2018-02-01'),
        }
      },
      currencyRates: {
        '2018-01-01': {
          DKK: 8,
          SEK: 10
        },
        '2018-01-02': {
          DKK: 8,
          SEK: 10
        }
      }
    },
    accounts: {
      data: [
        { id: 'a', name: 'Account 1', currency: 'SEK' },
        { id: 'b', name: 'Account 2', currency: 'DKK' }
      ]
    },
    app: {}
  };

  it('should render nothing when there are no transactions at all', () => {
    const store = mockStore({
      transactions: {
        data: []
      },
      categories: {
        data: []
      },
      edit: {
        dateSelect: {},
        charts: {}
      },
      accounts: {
        data: []
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Charts />
        </Provider>
      </MemoryRouter>
    );
    expect(container.render().text()).toEqual('No data yet. Add some.');
  });

  it('should render expenses/incomes graph when there are transactions', () => {
    const store = mockStore(baseData);

    const wrapper = mount(
      <Provider store={store}>
        <Charts />
      </Provider>
    );
    const charts = wrapper.find('Charts');
    const barChart = charts.find('AmountSumBar').find('BarChart');
    expect(barChart.length).toEqual(1);
    expect(barChart.props().data).toEqual([
      {
        key: '2018-01',
        value: -0.5 // The -2 DKK is converted to -2.50 SEK - 1 SEK + 3 SEK = -0.5
      },
    ]);

    const lineChart = charts.find('IncomeExpensesLine').find('CustomLineChart');
    expect(lineChart.length).toEqual(1);
    expect(lineChart.props().data).toEqual([
      {
        key: '2018-01-01',
        income: 0,
        expenses: 3.5 // The -2 DKK is converted to -2.50 SEK - 1 SEK = -3.5 and absolute value 3.5 is used
      },
      {
        key: '2018-01-02',
        income: 3,
        expenses: 0
      }
    ]);

    const summary = charts.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();

    // 3.5 is rounded to 4 in the cards.
    expect(rendered.find('.card').eq(0).text()).toMatch('4Expenses');
    expect(rendered.find('.card').eq(1).text()).toMatch('3Income')
    expect(rendered.find('.card').eq(2).text()).toMatch('4Spent on "Groceries"');
  });

  it('should render nothing when outside daterange', () => {
    const data = Object.assign({}, baseData);
    data.edit = {
      charts: {},
      dateSelect: {
        'chart-dates': {
          startDate: moment('2017-12-01'),
          endDate: moment('2017-12-24'),
        }
      },
      currencyRates: {}
    };
    const store = mockStore(data);

    const wrapper = mount(
      <Provider store={store}>
        <Charts />
      </Provider>
    );
    const summary = wrapper.find('Charts').find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toMatch('0Expenses');
    expect(rendered.find('.card').eq(1).text()).toMatch('0Income');
  });

  it('should exclude ignored transactions', () => {
    const data = Object.assign({}, baseData);
    data.transactions = {
      data: [
        {
          date: '2018-01-01',
          amount: -1,
          category: {},
          ignore: true
        },
        {
          date: '2018-01-01',
          amount: -1,
          category: {},
          account: 'a'
        },
        {
          date: '2018-01-02',
          amount: 3,
          category: {},
          account: 'a'
        }
      ]
    };
    const store = mockStore(data);

    const wrapper = mount(
      <Provider store={store}>
        <Charts />
      </Provider>
    );
    const charts = wrapper.find('Charts');
    const barChart = charts.find('AmountSumBar').find('BarChart');
    expect(barChart.length).toEqual(1);
    expect(barChart.props().data).toEqual([
      {
        key: '2018-01',
        value: 2
      }
    ]);

    const summary = charts.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toMatch('1Expenses');
    expect(rendered.find('.card').eq(1).text()).toMatch('3Income')
  });

  it('should show parent categories only, when requested', () => {
    const newEdit = Object.assign({}, baseData.edit);
    const data = Object.assign({}, baseData);
    data.edit = newEdit;
    data.edit.charts.groupByParentCategory = true;
    const store = mockStore(data);

    const wrapper = mount(
      <Provider store={store}>
        <Charts />
      </Provider>
    );
    const summary = wrapper.find('Charts').find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    // "Food", rather than "Groceries"
    expect(rendered.find('.card').eq(2).text()).toMatch('4Spent on "Food"');
  });

  describe('base currency dropdown', () => {
    it('should show base currency dropdown', () => {
      const store = mockStore(baseData);
      const wrapper = mount(
        <Provider store={store}>
          <Charts />
        </Provider>
      );
      const charts = wrapper.find('Charts');
      const options = charts.find('#base-currency > option');
      expect(options.length).toEqual(2);
      expect(options.at(0).text()).toEqual('DKK');
      expect(options.at(1).text()).toEqual('SEK');
    });

    it('should not show base currency when there are less than two currencies', () => {
      const data = Object.assign({}, baseData);
      data.accounts = {
        data: [
          { id: 'a', name: 'Account 1', currency: 'SEK' }
        ]
      }
      data.transactions = {
        data: [{
          date: '2018-01-01',
          amount: -1,
          category: {},
          account: 'a'
        }],
      };
      const store = mockStore(data);
      const wrapper = shallow(
        <Provider store={store}>
          <Charts />
        </Provider>
      );
      const charts = wrapper.find('Charts');
      const options = charts.find('#base-currency > option');
      expect(options.length).toEqual(0);
    });
  });

  describe('currency fetch', () => {
    beforeEach(() => fetch.resetMocks());
    afterEach(() => fetch.resetMocks());

    it('should start fetching currency rates if they are undefined', () => {
      const rates = {
        '2018-01-01': {
          DKK: 7.5,
          SEK: 9.5
        }
      };
      fetch.once(JSON.stringify(rates));

      const data = Object.assign({}, baseData);
      data.edit = { dateSelect: {}, charts: {} };
      const store = mockStore(data);
      mount(
        <Provider store={store}>
          <Charts />
        </Provider>
      );
      expect(store.getActions()).toEqual([
        { type: actions.START_FETCH_CURRENCY_RATES }
      ]);
      expect(fetch).toBeCalled();
    });

    it('should not fetch currency rates if they are defined', () => {
      const store = mockStore(baseData);
      // Needs to fully mount to ensure componentDidMount is called
      mount(
        <Provider store={store}>
          <Charts />
        </Provider>
      );
      expect(store.getActions()).toEqual([]);
    });
  });
});
