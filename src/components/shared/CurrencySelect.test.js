import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import CurrencySelect from './CurrencySelect';

describe('Currency Select', () => {
  const mockStore = configureStore([thunk]);

  beforeEach(() => {
    fetch.resetMocks();
    fetch.once(JSON.stringify(['USD', 'JPY']))
  });
  afterEach(() => fetch.resetMocks());

  it('should render nothing when there are no currencies', () => {
    const store = mockStore({ app: {}, edit: {} });

    const container = shallow(
      <Provider store={store}>
        <CurrencySelect />
      </Provider>
    );
    expect(container.render().text()).toEqual('');
  });

  it('should show a select when there are currencies', () => {
    const store = mockStore({
      app: {},
      edit: {
        currencies: ['USD', 'JPY']
      }
    });

    const container = mount(
      <Provider store={store}>
        <CurrencySelect />
      </Provider>
    );
    expect(container.find('Select').length).toEqual(1);
  });

  it('should fetch currencies', async () => {
    const store = mockStore({ app: {}, edit: {} });

    mount(
      <Provider store={store}>
        <CurrencySelect />
      </Provider>
    );

    // This will give the fetch a chance to finish
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      });
    });

    // Assert that the actions were called
    expect(fetch).toBeCalled();
    expect(store.getActions()[1].currencies).toEqual([
      'USD', 'JPY'
    ]);
  });
});