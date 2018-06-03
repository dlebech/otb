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
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import faLightbulb from '@fortawesome/fontawesome-free-solid/faLightbulb';
import faDownload from '@fortawesome/fontawesome-free-solid/faDownload';
import faThumbsDown from '@fortawesome/fontawesome-free-solid/faThumbsDown';
import faThumbsUp from '@fortawesome/fontawesome-free-solid/faThumbsUp';
import faTrashAlt from '@fortawesome/fontawesome-free-solid/faTrashAlt';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import faBan from '@fortawesome/fontawesome-free-solid/faBan';
import faSort from '@fortawesome/fontawesome-free-solid/faSort';
import faSortUp from '@fortawesome/fontawesome-free-solid/faSortUp';
import faSortDown from '@fortawesome/fontawesome-free-solid/faSortDown';
fontawesome.library.add(
  faUpload,
  faChartBar,
  faTable,
  faDatabase,
  faQuestionCircle,
  faEdit,
  faLightbulb,
  faDownload,
  faThumbsUp,
  faThumbsDown,
  faTrashAlt,
  faPlus,
  faBan,
  faSort,
  faSortUp,
  faSortDown
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
