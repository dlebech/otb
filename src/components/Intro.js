import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createTestData } from '../actions';
import RestoreData from './manageData/RestoreData';

const IntroWithData = props => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Welcome back!</h1>
      <p className="lead">
        You have {props.numTransactions} transactions so far.
      </p>
      <hr />
      <Link className="btn btn-primary m-1" to="/transactions/upload">
        <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
        Upload more transactions
      </Link>
      <Link className="btn btn-secondary m-1" to="/transactions">
        <FontAwesomeIcon icon="table" className="mr-1" fixedWidth />
        Existing transactions
      </Link>
      <Link className="btn btn-secondary m-1" to="/charts">
        <FontAwesomeIcon icon="chart-bar" className="mr-1" fixedWidth />
        Charts
      </Link>
    </div>
  );
};

const IntroWithoutData = props => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Off The Books</h1>
      <p className="lead">Privacy-First Bank Transaction Analysis</p>
      <hr />
      <p>
        Catchy headline eh? But seriously, if you have a list of bank
        transactions, and you want to see some pretty graphs, go ahead and
        upload the file here. The data stays in your browser and is not
        shared or stored anywhere else.
      </p>
      <Link className="btn btn-primary btn-lg m-1" to="/transactions/upload">Upload Transactions</Link>
      <RestoreData className="btn btn-secondary btn-lg m-1" persistor={props.persistor}>
        Restore Data
        <FontAwesomeIcon
          icon="question-circle"
          className="ml-1"
          fixedWidth
          data-tip="If you have been here before, you can restore a previously downloaded data file and continue your work."
          onClick={e => {
            e.stopPropagation();
            return false;
          }}
        />
      </RestoreData>
      <div
        className="btn btn-secondary btn-lg m-1"
        onClick={props.handleCreateData}
      >
        Demo
        <FontAwesomeIcon
          icon="question-circle"
          className="ml-1"
          fixedWidth
          data-tip="If you just want to see how things work, you can create some test data and browse around."
          onClick={e => {
            e.stopPropagation();
            return false;
          }}
        />
      </div>
      <ReactTooltip className="small-tip" />
    </div>
  );
};

const Intro = props => {
  if (props.numTransactions > 0) return <IntroWithData {...props} />;
  return <IntroWithoutData {...props} />;
};

const mapStateToProps = state => {
  return {
    numTransactions: state.transactions.data.length
  }
};

const mapDispatchToProps = dispatch => {
  return {
    handleCreateData: () => dispatch(createTestData())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Intro);
