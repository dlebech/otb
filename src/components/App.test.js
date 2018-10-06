import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import App from './App';

describe('App', () => {
  const mockStore = configureStore();

  it('should render a loader', () => {
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
    const rendered = container.render();
    expect(rendered.find('div[title="Loading..."]').length).toEqual(1);
  });
});