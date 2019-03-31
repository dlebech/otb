import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import Categories from './Categories';

jest.mock('redux-modal', () => {
  return {
    connectModal: () => () => () => <span>YOLO</span>
  };
});

describe('Categories', () => {
  const mockStore = configureStore();

  it('should show new category button', () => {
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
        <Provider store={store}>
          <Categories />
        </Provider>
      </MemoryRouter>
    );

    const c = container.render();
    expect(c.find('li').length).toEqual(0);
    expect(c.find('button').length).toEqual(1);
    expect(c.find('button').text()).toEqual('Add New Category');
  });

  it('should show categories', () => {
    const store = mockStore({
      transactions: {
        data: []
      },
      categories: {
        data: [{
          id: 'abcd',
          name: 'Food'
        }]
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Categories />
        </Provider>
      </MemoryRouter>
    );

    const c = container.render();
    expect(c.find('li').length).toEqual(1);
    expect(c.find('li').text()).toEqual('Food (0)');
  });

  it('should show hierachical structure', () => {
    const store = mockStore({
      transactions: {
        data: []
      },
      categories: {
        data: [
          {
            id: 'abcd',
            name: 'Food'
          },
          {
            id: 'efgh',
            name: 'Groceries',
            parent: 'abcd'
          }
        ]
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Categories />
        </Provider>
      </MemoryRouter>
    );

    const c = container.render();
    // Find two lists in total
    expect(c.find('ul').length).toEqual(2);

    // Find one nested list
    expect(c.find('ul').first().find('ul').length).toEqual(1);

    // Test the text
    expect(c.find('ul').first().find('ul').text()).toMatch('Groceries');
  });

  it('should show transaction counts', () => {
    const store = mockStore({
      transactions: {
        data: [
          {
            id: 'a',
            category: {
              confirmed: 'abcd'
            }
          },
          {
            id: 'b',
            category: {
              confirmed: 'abcd'
            }
          },
          {
            id: 'c',
            category: {
              confirmed: 'efgh'
            }
          }
        ]
      },
      categories: {
        data: [
          {
            id: 'abcd',
            name: 'Food'
          },
          {
            id: 'efgh',
            name: 'Groceries',
            parent: 'abcd'
          }
        ]
      }
    });

    const container = shallow(
      <MemoryRouter>
        <Provider store={store}>
          <Categories />
        </Provider>
      </MemoryRouter>
    );

    const c = container.render();

    // Find two lists in total
    expect(c.find('ul').text()).toMatch('Food (2)Groceries (1)');
  });
});
