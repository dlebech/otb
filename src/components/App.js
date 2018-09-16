import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Intro from './Intro';
import Menu from './Menu';
import TransactionUpload from './TransactionUpload';
import Charts from './Charts';
import Transactions from './Transactions';
import ManageData from './ManageData';
import Privacy from './Privacy';
import Footer from './Footer';

const App = props => {
  return (
    <Router>
      <React.Fragment>
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
      </React.Fragment>
    </Router>
  );
}

export default App;
