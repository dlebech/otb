import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import App from './App';

describe('App', () => {
  const mockStore = configureStore();

  it('should render the intro without data, render the footer, and not the menu', () => {
    const store = mockStore({
      app: {
        storage: {
          localStorage: false
        }
      },
      transactions: {
        data: []
      },
    });

    const container = shallow(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>
          <App />
        </Provider>
      </MemoryRouter>
    );
    expect(container.find('Menu').length).toEqual(0);
    const rendered = container.render();
    expect(rendered.find('h1').text()).toEqual('Off The Books');
    expect(rendered.find('a').last().text()).toEqual('Source Code');
  });

  it('should render the intro with data', () => {
    const store = mockStore({
      app: {
        storage: {
          localStorage: false
        }
      },
      transactions: {
        data: [{}]
      },
    });

    const container = shallow(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>
          <App />
        </Provider>
      </MemoryRouter>
    );
    const rendered = container.render();
    expect(rendered.find('h1').text()).toEqual('Welcome back!');
    expect(rendered.find('p').first().text()).toEqual('You have 1 transactions so far.');
  });
});