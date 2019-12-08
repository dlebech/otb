import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Loading from './shared/Loading';
import loadable from '@loadable/component';

const Menu = loadable(() => import('./Menu'));

const Intro = loadable(() => import('./Intro'), {
  fallback: <Loading />
});

const TransactionAdd = loadable(() => import('./TransactionAdd'), {
  fallback: <Loading />
});

const Transactions = loadable(() => import('./Transactions'), {
  fallback: <Loading />
});

const Charts = loadable(() => import('./Charts'), {
  fallback: <Loading />
});

const ManageData = loadable(() => import('./ManageData'), {
  fallback: <Loading />
});

const Privacy = loadable(() => import('./Privacy'), {
  fallback: <Loading />
});

const Footer = loadable(() => import('./Footer'));

const App = props => {
  return (
    <Router>
      <>
        <Route path="/*" render={routeProps => <Menu persistor={props.persistor} {...routeProps} />} />
        <div className="container mt-4">
          <Route exact path="/" render={routeProps => <Intro persistor={props.persistor} {...routeProps} />} />
          <Route exact path="/charts" component={Charts} />
          <Route exact path="/transactions" component={Transactions} />
          <Route exact path="/transactions/add" component={TransactionAdd} />
          <Route exact path="/data" render={routeProps => <ManageData persistor={props.persistor} {...routeProps} />} />
          <Route exact path="/privacy" component={Privacy} />
        </div>
        <Route path="/*" component={Footer} />
      </>
    </Router>
  );
}

export default App;
