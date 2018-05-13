import React from 'react';
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
            amount: 1,
          },
          {
            date: '2018-01-01',
            amount: 1,
          },
          {
            date: '2018-01-02',
            amount: 3,
          }
        ]
      },
      categories: {
        data: []
      }
    });

    const wrapper = mount(<Chart store={store} />);
    const lineChart = wrapper.find('LineChart');
    expect(lineChart.length).toEqual(1);
    expect(lineChart.props().data).toEqual([
      {
        key: '2018-01-01',
        value: 2,
      },
      {
        key: '2018-01-02',
        value: 3,
      }
    ]);
  });
});
