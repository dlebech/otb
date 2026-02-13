import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../types/redux';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createTestData } from '../actions';
import { RootState } from '../reducers';
import RestoreData from './manageData/RestoreData';

function IntroWithData({ numTransactions }: { numTransactions: number }) {
  return (
    <div className="bg-gray-100 rounded-lg p-8 mb-6">
      <h1 className="text-5xl font-light">Welcome back!</h1>
      <p className="text-xl text-gray-600">
        You have {numTransactions} transactions so far.
      </p>
      <hr />
      <Link className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium m-1" href="/transactions/add">
        <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
        Add more transactions
      </Link>
      <Link className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium m-1" href="/transactions">
        <FontAwesomeIcon icon="table" className="mr-1" fixedWidth />
        Existing transactions
      </Link>
      <Link className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium m-1" href="/charts">
        <FontAwesomeIcon icon="chart-bar" className="mr-1" fixedWidth />
        Charts
      </Link>
    </div>
  );
};

function IntroWithoutData({
  handleCreateData
}: { handleCreateData: () => void }) {
  return (
    <div className="bg-gray-100 rounded-lg p-8 mb-6">
      <h1 className="text-5xl font-light">OTB</h1>
      <p className="text-xl text-gray-600">Privacy-First Bank Transaction Analysis</p>
      <hr />
      <p>
        Catchy headline eh? But seriously, if you have some bank transactions
        in a file, go ahead and add the file here to see a few graphs &mdash;
        or try the &quot;demo&quot;. The data stays in your browser and is not shared
        or stored anywhere else.
      </p>
      <Link className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-lg m-1" href="/transactions/add">Add Transactions</Link>
      <RestoreData className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-lg m-1">
        Restore Data
        <FontAwesomeIcon
          icon="question-circle"
          className="ml-1"
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
        className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-lg m-1 cursor-pointer"
        onClick={handleCreateData}
      >
        Demo
        <FontAwesomeIcon
          icon="question-circle"
          className="ml-1"
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

export default function Intro() {
  const dispatch = useDispatch<AppDispatch>();
  const numTransactions = useSelector((state: RootState) => state.transactions.data.length);

  const handleCreateData = useCallback(() => {
    dispatch(createTestData());
    // navigate('/transactions');
  }, [dispatch]);

  if (numTransactions > 0) {
    return <IntroWithData numTransactions={numTransactions} />;
  }
  
  return <IntroWithoutData handleCreateData={handleCreateData} />;
};

