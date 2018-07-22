import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Intro from './Intro';
import Menu from './Menu';
import TransactionUpload from './TransactionUpload';
import Chart from './Chart';
import Transactions from './Transactions';
import Data from './Data';
import Privacy from './Privacy';
import Footer from './Footer';

const App = props => {
  return (
    <Router>
      <React.Fragment>
        <Route path="/*" render={routeProps => <Menu persistor={props.persistor} {...routeProps} />} />
        <div className="container mt-4">
          <Route exact path="/" render={routeProps => <Intro persistor={props.persistor} {...routeProps} />} />
          <Route exact path="/chart" component={Chart} />
          <Route exact path="/transaction" component={Transactions} />
          <Route exact path="/transaction/upload" component={TransactionUpload} />
          <Route exact path="/data" render={routeProps => <Data persistor={props.persistor} {...routeProps} />} />
          <Route exact path="/privacy" component={Privacy} />
        </div>
        <Route path="/*" component={Footer} />
      </React.Fragment>
    </Router>
  );
}

export default App;
