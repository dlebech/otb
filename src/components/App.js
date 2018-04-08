import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import TransactionUpload from './TransactionUpload';

const App = props => {
  return (
    <Router>
      <div className="container">
        <Route exact path="/" component={TransactionUpload} />
      </div>
    </Router>
  );
}

export default App;
