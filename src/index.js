import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './css/index.css';
import App from './components/App';
import configureStore from './configureStore';
import registerServiceWorker from './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.css'; // Makes sure bootstrap is always available.

// Build the fontawesome library
import fontawesome from '@fortawesome/fontawesome';
import faUpload from '@fortawesome/fontawesome-free-solid/faUpload';
import faChartBar from '@fortawesome/fontawesome-free-solid/faChartBar';
import faTable from '@fortawesome/fontawesome-free-solid/faTable';
import faDatabase from '@fortawesome/fontawesome-free-solid/faDatabase';
import faQuestionCircle from '@fortawesome/fontawesome-free-solid/faQuestionCircle';
fontawesome.library.add(
  faUpload,
  faChartBar,
  faTable,
  faDatabase,
  faQuestionCircle
);

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
