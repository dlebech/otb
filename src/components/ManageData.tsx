import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../types/redux';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RestoreData from './manageData/RestoreData';
import Categories from './manageData/Categories';
import Accounts from './manageData/Accounts';
import Categorizer from './manageData/Categorizer';
import * as actions from '../actions';
import { arrayToObjectLookup } from '../util';
import { RootState } from '../reducers';
import { Transaction } from '../types/redux';

interface ManageDataProps {
  persistor: any;
}

export default function ManageData({ persistor }: ManageDataProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const state = useSelector((state: RootState) => state);
  
  const { numTransactions, numTransactionsCategorized, numTransactionsUncategorized, numTransactionsWithoutAccount } = useSelector((state: RootState) => {
    let categorized = 0;
    let withoutAccount = 0;
    state.transactions.data.forEach((t: Transaction) => {
      if (!!t.category.confirmed) categorized++;
      if (!t.account) withoutAccount++;
    });
    const uncategorized = state.transactions.data.length - categorized;

    return {
      numTransactions: state.transactions.data.length,
      numTransactionsCategorized: categorized,
      numTransactionsUncategorized: uncategorized,
      numTransactionsWithoutAccount: withoutAccount
    };
  });

  const handleDownload = useCallback(async () => {
    const [whitelist, download] = await Promise.all([
      import('../configureStore').then(m => m.persistConfig.whitelist),
      import('downloadjs').then(m => m.default)
    ]);

    // Include only whitelisted store items.
    const stateToDownload: any = {};
    whitelist.forEach(w => stateToDownload[w] = (state as any)[w]);

    // Create a data blog and download it.
    const blob = new Blob([JSON.stringify(stateToDownload)], {
      type: 'application/json'
    });
    download(blob, 'data.json', 'application/json');
  }, [state]);

  const handleCsvDownload = useCallback(async () => {
    const [Papa, download] = await Promise.all([
      import('papaparse').then(m => m.default),
      import('downloadjs').then(m => m.default)
    ]);

    const accounts = arrayToObjectLookup(state.accounts.data);
    const categories = arrayToObjectLookup(state.categories.data);
    const lines = state.transactions.data.map((t: Transaction) => {
      const line: any[] = [
        t.id,
        t.date,
        t.description,
        t.descriptionCleaned,
        t.amount,
        t.total,
      ];

      let categoryId = '';
      let categoryName = '';
      if (t.category && t.category.confirmed) {
        categoryId = t.category.confirmed;

        const category = categories[t.category.confirmed];

        // The category not found should never happen :-)
        categoryName = category.name || 'CATEGORY NOT FOUND';
        if (category.parent) {
          categoryName = categories[category.parent].name + ' > ' + categoryName;
        }
      }

      line.push(categoryId);
      line.push(categoryName);

      let accountId = '';
      let accountName = '';
      let accountCurrency = ''
      if (t.account) {
        accountId = t.account;
        const account = accounts[t.account];

        // The account not found should never happen :-)
        accountName = account.name || 'ACCOUNT NOT FOUND';
        accountCurrency = account.currency || '';
      }

      line.push(accountId);
      line.push(accountName);
      line.push(accountCurrency);

      return line;
    });

    // Sort by date
    lines.sort((a: any[], b: any[]) => a[1].localeCompare(b[1]));

    const csvString = Papa.unparse({
      fields: [
        'transaction_id',
        'date',
        'description',
        'description_cleaned',
        'amount',
        'total',
        'category_id',
        'category_name',
        'account_id',
        'account_name',
        'account_currency',
      ],
      data: lines
    });

    const blob = new Blob([csvString], { type: 'text/csv' });
    download(blob, 'transactions.csv', 'text/csv');
  }, [state.accounts.data, state.categories.data, state.transactions.data]);

  const handleSetAccountOnTransactions = useCallback(() => {
    dispatch(actions.setEmptyTransactionsAccount(state.accounts.data[0].id));
  }, [dispatch, state.accounts.data]);

  return (
    <>
      <div className="row">
        <div className="col">
          <dl className="row">
            <dt className="col-auto">Total transactions:</dt>
            <dd className="col-auto">{numTransactions}</dd>
            <dt className="col-auto">Categorized:</dt>
            <dd className="col-auto">{numTransactionsCategorized}</dd>
            <dt className="col-auto">Uncategorized:</dt>
            <dd className="col-auto">{numTransactionsUncategorized}</dd>
          </dl>
        </div>
      </div>
      {numTransactionsWithoutAccount > 0 && <div className="row">
        <div className="col-auto alert alert-warning">
          <p>
            <strong>Transactions without an account:</strong> {numTransactionsWithoutAccount}
          </p>
          <button
            type="button"
            id="set-account-on-transactions"
            className="btn btn-primary"
            onClick={handleSetAccountOnTransactions}
          >
            Set an account on these transactions
          </button>
        </div>
      </div>}
      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-outline-primary m-1"
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon="download" className="me-1" fixedWidth />
            Download All Data
          </button>
          <RestoreData className="btn btn-outline-secondary m-1" persistor={persistor}>
            Restore Previous Download
          </RestoreData>
          <button
            type="button"
            className="btn btn-outline-secondary m-1"
            onClick={handleCsvDownload}
          >
            Download transactions as CSV
          </button>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col-md-6">
          <h3>Categories</h3>
          <Categories />
        </div>
        <div className="col-md-6">
          <h3>Accounts</h3>
          <div>
            <Accounts />
          </div>
          <div className="mt-md-3">
            <Categorizer />
          </div>
        </div>
      </div>
      <Tooltip id="manage-data-tooltip" />
    </>
  );
};

