import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const IntroWithData = () => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Welcome back</h1>
      <p className="lead">Looks like you've been here before :-)</p>
      <hr />
      <Link className="btn btn-primary" to="/upload">
        Upload more transactions
      </Link>
      <Link className="btn btn-secondary mx-2" to="/chart">
        Charts
      </Link>
      <Link className="btn btn-secondary" to="/transaction">
        All transactions
      </Link>
    </div>
  );
};

const IntroWithoutData = () => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Off The Books</h1>
      <p className="lead">Privacy-First Bank Transaction Analysis</p>
      <hr />
      <p>
        Catchy headline eh? But seriously, if you have a list of bank transactions, and you want to see some pretty graphs, go ahead and upload the file here. It will never be stored anywhere.
      </p>
      <Link className="btn btn-dark btn-lg" to="/upload">Get Started</Link>
    </div>
  );
};

const Intro = props => {
  if (props.hasData) return <IntroWithData />;
  return <IntroWithoutData />;
};

const mapStateToProps = state => {
  return {
    hasData: state.transactions.data.length > 0
  }
};

export default connect(mapStateToProps)(Intro);
