import React from 'react';
import { Provider } from 'react-redux';
import moment from 'moment';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import CategoryExpenses from './CategoryExpenses';

describe('CategoryExpenses', () => {
  const mockStore = configureStore();

  // To keep connected sub-components happy
  const baseStore = {
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
        },
        {
          id: 'c',
          name: 'Home'
        }
      ]
    }
  };

  // The base properties to pass to CategoryExpenses.
  const baseProps = {
    handleCategoryChange: jest.fn(),
    sortedCategoryExpenses: [
      {
        value: {
          amount: 456,
          category: {
            id: 'a'
          },
          transactions: [{
            date: moment('2020-03-10'),
            amount: 456
          }]
        }
      },
      {
        value: {
          amount: 123,
          transactions: [{
            date: moment('2020-03-10'),
            amount: 123
          }],
          category: {
            id: 'b'
          }
        }
      },
      {
        value: {
          amount: 789,
          transactions: [{
            date: moment('2020-03-10'),
            amount: 789 
          }],
          category: {
            id: 'c'
          }
        }
      },
    ],
    categories: {
      a: {
        id: 'a',
        name: 'Food'
      },
      b: {
        id: 'b',
        name: 'Groceries',
        parent: 'a'
      },
      c: {
        id: 'c',
        name: 'Home'
      }
    },
    startDate: moment('2020-03-01'),
    endDate: moment('2020-03-15'),
  };

  it('should not filter categories when filter is empty', () => {
    const store = mockStore(baseStore);

    const container = shallow(
      <Provider store={store}>
        <CategoryExpenses
          {...baseProps}
          filterCategories={new Set()}
        />
      </Provider>
    );
    const lineChartProps = container.find('CategoryExpenses')
      .dive()
      .find('CategoryLine')
      .first()
      .props();
    
    expect(lineChartProps.sortedCategoryExpenses).toHaveLength(3);
  });

  it('should filter specific categories', () => {
    const store = mockStore(baseStore);
    const container = shallow(
      <Provider store={store}>
        <CategoryExpenses
          {...baseProps}
          filterCategories={new Set(['b'])}
        />
      </Provider>
    );
    const lineChartProps = container.find('CategoryExpenses')
      .dive()
      .find('CategoryLine')
      .first()
      .props();
    
    expect(lineChartProps.sortedCategoryExpenses).toHaveLength(1);
    expect(lineChartProps.sortedCategoryExpenses[0].value.amount).toEqual(123);
  });

  it('should filter specific categories and their children', () => {
    const store = mockStore(baseStore);
    const container = shallow(
      <Provider store={store}>
        <CategoryExpenses
          {...baseProps}
          filterCategories={new Set(['a'])}
        />
      </Provider>
    );
    const lineChartProps = container.find('CategoryExpenses')
      .dive()
      .find('CategoryLine')
      .first()
      .props();
    
    expect(lineChartProps.sortedCategoryExpenses).toHaveLength(2);
    expect(lineChartProps.sortedCategoryExpenses[0].value.amount).toEqual(456);
    expect(lineChartProps.sortedCategoryExpenses[1].value.amount).toEqual(123);
  });
});