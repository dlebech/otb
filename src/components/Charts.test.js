import React from 'react';
import moment from 'moment';
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
          category: {},
          account: 'a'
        },
        {
          date: '2018-01-01',
          amount: -1,
          category: {},
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
      data: []
    },
    edit: {
      charts: {},
      dateSelect: {
        'chart-dates': {
          startDate: moment('2017-12-01'),
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

  it('should render nothing when there are no transactions', () => {
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
        <Charts store={store} />
      </MemoryRouter>
    );
    expect(container.render().text()).toEqual('No data yet. Add some.');
  });

  it('should render transactions graph when there are transactions', () => {
    const store = mockStore(baseData);

    const wrapper = mount(<Charts store={store} />);
    const lineChart = wrapper.find('LineChart');
    expect(lineChart.length).toEqual(1);
    expect(lineChart.props().data).toEqual([
      {
        key: '2018-01-01',
        value: -2.25, // The -1 DKK is converted to 1.25 SEK
      },
      {
        key: '2018-01-02',
        value: 3,
      }
    ]);

    const summary = wrapper.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toMatch('2Expenses');
    expect(rendered.find('.card').eq(1).text()).toMatch('3Income')
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

    const wrapper = mount(<Charts store={store} />);
    const summary = wrapper.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toMatch('0Expenses');
    expect(rendered.find('.card').eq(1).text()).toMatch('0Income')
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

    const wrapper = mount(<Charts store={store} />);
    const lineChart = wrapper.find('LineChart');
    expect(lineChart.length).toEqual(1);
    expect(lineChart.props().data).toEqual([
      {
        key: '2018-01-01',
        value: -1,
      },
      {
        key: '2018-01-02',
        value: 3,
      }
    ]);

    const summary = wrapper.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toMatch('1Expenses');
    expect(rendered.find('.card').eq(1).text()).toMatch('3Income')
  });

  describe('base currency dropdown', () => {
    it('should show base currency dropdown', () => {
      const store = mockStore(baseData);
      const wrapper = shallow(<Charts store={store} />);
      const rendered = wrapper.render();
      const options = rendered.find('select > option');
      expect(options.length).toEqual(2);
      expect(options.eq(0).text()).toEqual('SEK');
      expect(options.eq(1).text()).toEqual('DKK');
    });

    it('should not show base currency when there are less than two currencies', () => {
      const data = Object.assign({}, baseData);
      data.accounts = {
        data: [
          { id: 'a', name: 'Account 1', currency: 'SEK'}
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
      const wrapper = shallow(<Charts store={store} />);
      const rendered = wrapper.render();
      const options = rendered.find('select > option');
      expect(options.length).toEqual(0);
    });
  });

  describe('currency fetch', () => {
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
      mount(<Charts store={store} />);
      expect(store.getActions()).toEqual([
        { type: actions.START_FETCH_CURRENCY_RATES }
      ]);
      expect(fetch).toBeCalled();
    });

    it('should not fetch currency rates if they are defined', () => {
      const store = mockStore(baseData);
      mount(<Charts store={store} />);
      expect(store.getActions()).toEqual([]);
    });
  });
});
