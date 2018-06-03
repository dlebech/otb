import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './css/index.css';
import App from './components/App';
import configureStore from './configureStore';
import configureFa from './configureFa';
import registerServiceWorker from './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.css'; // Makes sure bootstrap is always available.

configureFa();
const { store, persistor } = configureStore({});

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App persistor={persistor} />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}

registerServiceWorker();
