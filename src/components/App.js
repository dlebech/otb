import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Intro from './Intro';
import TransactionUpload from './TransactionUpload';
import Chart from './Chart';

const App = props => {
  return (
    <Router>
      <div className="container mt-4">
        <Route exact path="/" component={Intro} />
        <Route exact path="/upload" component={TransactionUpload} />
        <Route exact path="/chart" component={Chart} />
      </div>
    </Router>
  );
}

export default App;
