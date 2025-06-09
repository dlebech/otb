import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createTestData } from '../actions';
import { RootState } from '../reducers';
import RestoreData from './manageData/RestoreData';

interface IntroProps {
  persistor?: any;
}

function IntroWithData({ numTransactions }: { numTransactions: number }) {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Welcome back!</h1>
      <p className="lead">
        You have {numTransactions} transactions so far.
      </p>
      <hr />
      <Link className="btn btn-primary m-1" href="/transactions/add">
        <FontAwesomeIcon icon="upload" className="me-1" fixedWidth />
        Add more transactions
      </Link>
      <Link className="btn btn-secondary m-1" href="/transactions">
        <FontAwesomeIcon icon="table" className="me-1" fixedWidth />
        Existing transactions
      </Link>
      <Link className="btn btn-secondary m-1" href="/charts">
        <FontAwesomeIcon icon="chart-bar" className="me-1" fixedWidth />
        Charts
      </Link>
    </div>
  );
};

function IntroWithoutData({ 
  persistor, 
  handleCreateData 
}: { persistor?: any; handleCreateData: () => void }) {
  return (
    <div className="jumbotron">
      <h1 className="display-4">OTB</h1>
      <p className="lead">Privacy-First Bank Transaction Analysis</p>
      <hr />
      <p>
        Catchy headline eh? But seriously, if you have some bank transactions
        in a file, go ahead and add the file here to see a few graphs &mdash;
        or try the "demo". The data stays in your browser and is not shared
        or stored anywhere else.
      </p>
      <Link className="btn btn-primary btn-lg m-1" href="/transactions/add">Add Transactions</Link>
      <RestoreData className="btn btn-secondary btn-lg m-1" persistor={persistor}>
        Restore Data
        <FontAwesomeIcon
          icon="question-circle"
          className="ms-1"
          fixedWidth
          data-tooltip-id="restore-tip"
          data-tooltip-content="If you have been here before, you can restore a previously downloaded data file and continue your work."
          onClick={e => {
            e.stopPropagation();
            return false;
          }}
        />
      </RestoreData>
      <div
        className="btn btn-secondary btn-lg m-1"
        onClick={handleCreateData}
      >
        Demo
        <FontAwesomeIcon
          icon="question-circle"
          className="ms-1"
          fixedWidth
          data-tooltip-id="demo-tip"
          data-tooltip-content="If you just want to see how things work, you can create some test data and browse around."
          onClick={e => {
            e.stopPropagation();
            return false;
          }}
        />
      </div>
      <Tooltip id="restore-tip" className="small-tip" />
      <Tooltip id="demo-tip" className="small-tip" />
    </div>
  );
};

export default function Intro({ persistor }: IntroProps) {
  const dispatch = useDispatch();
  const numTransactions = useSelector((state: RootState) => state.transactions.data.length);

  const handleCreateData = useCallback(() => {
    dispatch(createTestData());
    // navigate('/transactions');
  }, [dispatch]);

  if (numTransactions > 0) {
    return <IntroWithData numTransactions={numTransactions} />;
  }
  
  return <IntroWithoutData persistor={persistor} handleCreateData={handleCreateData} />;
};

