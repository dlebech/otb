import React from 'react';
import moment from 'moment';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import Chart from './Chart';

describe('Chart', () => {
  const mockStore = configureStore();

  it('should render nothing when there are no transactions', () => {
    const store = mockStore({
      transactions: {
        data: []
      },
      categories: {
        data: []
      },
      edit: {
        dateSelect: {}
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Chart store={store} />
      </MemoryRouter>
    );
    expect(container.render().text()).toEqual('No data yet. Add some.');
  });

  it('should render transactions graph when there are transactions', () => {
    const store = mockStore({
      transactions: {
        data: [
          {
            date: '2018-01-01',
            amount: -1,
            category: {}
          },
          {
            date: '2018-01-01',
            amount: -1,
            category: {}
          },
          {
            date: '2018-01-02',
            amount: 3,
            category: {}
          }
        ]
      },
      categories: {
        data: []
      },
      edit: {
        dateSelect: {
          'chart-dates': {
            startDate: moment('2017-12-01'),
            endDate: moment('2018-02-01'),
          }
        }
      }
    });

    const wrapper = mount(<Chart store={store} />);
    const lineChart = wrapper.find('LineChart');
    expect(lineChart.length).toEqual(1);
    expect(lineChart.props().data).toEqual([
      {
        key: '2018-01-01',
        value: -2,
      },
      {
        key: '2018-01-02',
        value: 3,
      }
    ]);

    const summary = wrapper.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toEqual('2Expenses');
    expect(rendered.find('.card').eq(1).text()).toEqual('3Income')
  });

  it('should render nothing when outside daterange', () => {
    const store = mockStore({
      transactions: {
        data: [
          {
            date: '2018-01-01',
            amount: -1,
            category: {}
          }
        ]
      },
      categories: {
        data: []
      },
      edit: {
        dateSelect: {
          'chart-dates': {
            startDate: moment('2017-12-01'),
            endDate: moment('2017-12-24'),
          }
        }
      }
    });

    const wrapper = mount(<Chart store={store} />);
    const summary = wrapper.find('Summary');
    expect(summary.length).toEqual(1);
    const rendered = summary.render();
    expect(rendered.find('.card').eq(0).text()).toEqual('0Expenses');
    expect(rendered.find('.card').eq(1).text()).toEqual('0Income')
  });
});
