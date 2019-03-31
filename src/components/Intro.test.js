import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import Intro from './Intro';

describe('Intro ', () => {
  const mockStore = configureStore();

  it('should render the intro without data', () => {
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
          <Intro />
        </Provider>
      </MemoryRouter>
    );
    const rendered = container.render();
    expect(rendered.find('h1').text()).toEqual('Off The Books');
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
          <Intro />
        </Provider>
      </MemoryRouter>
    );
    const rendered = container.render();
    expect(rendered.find('h1').text()).toEqual('Welcome back!');
    expect(rendered.find('p').first().text()).toEqual('You have 1 transactions so far.');
  });
});