import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Loadable from 'react-loadable';
import Loading from './shared/Loading';

const Menu = Loadable({
  loader: () => import('./Menu'),
  loading: () => null
});

const Intro = Loadable({
  loader: () => import('./Intro'),
  loading: Loading
});

const TransactionUpload = Loadable({
  loader: () => import('./TransactionUpload'),
  loading: Loading
});

const Transactions = Loadable({
  loader: () => import('./Transactions'),
  loading: Loading
});

const Charts = Loadable({
  loader: () => import('./Charts'),
  loading: Loading
});

const ManageData = Loadable({
  loader: () => import('./ManageData'),
  loading: Loading
});

const Privacy = Loadable({
  loader: () => import('./Privacy'),
  loading: Loading
});

const Footer = Loadable({
  loader: () => import('./Footer'),
  loading: () => null
});

const App = props => {
  return (
    <Router>
      <>
        <Route path="/*" render={routeProps => <Menu persistor={props.persistor} {...routeProps} />} />
        <div className="container mt-4">
          <Route exact path="/" render={routeProps => <Intro persistor={props.persistor} {...routeProps} />} />
          <Route exact path="/charts" component={Charts} />
          <Route exact path="/transactions" component={Transactions} />
          <Route exact path="/transactions/upload" component={TransactionUpload} />
          <Route exact path="/data" render={routeProps => <ManageData persistor={props.persistor} {...routeProps} />} />
          <Route exact path="/privacy" component={Privacy} />
        </div>
        <Route path="/*" component={Footer} />
      </>
    </Router>
  );
}

export default App;
