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

  it('should show categories (alphabetically)', () => {
    const store = mockStore({
      transactions: {
        data: []
      },
      categories: {
        data: [
          {
            id: 'b',
            name: 'Food'
          },
          {
            id: 'a',
            name: 'Entertainment'
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
    expect(c.find('li').length).toEqual(2);
    expect(c.find('li').text()).toEqual('Entertainment (0)Food (0)');
  });

  it('should show hierachical structure (alphebetically)', () => {
    const store = mockStore({
      transactions: {
        data: []
      },
      categories: {
        data: [
          {
            id: 'b',
            name: 'Food'
          },
          {
            id: 'a',
            name: 'Entertainment'
          },
          {
            id: 'c',
            name: 'Groceries',
            parent: 'b'
          },
          {
            id: 'd',
            name: 'Bar',
            parent: 'b'
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

    // Test the text
    expect(c.find('ul').text()).toMatch('Entertainment (0)Food (0)Bar (0)Groceries (0)');
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
