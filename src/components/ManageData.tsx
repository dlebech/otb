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

export default function ManageData() {
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
    const stateToDownload: Record<string, unknown> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    whitelist.forEach(w => stateToDownload[w] = (state as Record<string, any>)[w]);

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
      const line: (string | number)[] = [
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
    lines.sort((a: (string | number)[], b: (string | number)[]) => (a[1] as string).localeCompare(b[1] as string));

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
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <dl className="flex flex-wrap gap-x-2 gap-y-1">
            <dt className="w-auto">Total transactions:</dt>
            <dd className="w-auto">{numTransactions}</dd>
            <dt className="w-auto">Categorized:</dt>
            <dd className="w-auto">{numTransactionsCategorized}</dd>
            <dt className="w-auto">Uncategorized:</dt>
            <dd className="w-auto">{numTransactionsUncategorized}</dd>
          </dl>
        </div>
      </div>
      {numTransactionsWithoutAccount > 0 && <div className="flex flex-wrap gap-6">
        <div className="w-auto rounded border border-yellow-300 bg-yellow-50 p-6 text-yellow-800">
          <p>
            <strong>Transactions without an account:</strong> {numTransactionsWithoutAccount}
          </p>
          <button
            type="button"
            id="set-account-on-transactions"
            className="inline-flex items-center justify-center rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
            onClick={handleSetAccountOnTransactions}
          >
            Set an account on these transactions
          </button>
        </div>
      </div>}
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded font-medium transition-colors border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 m-1"
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon="download" className="mr-1" fixedWidth />
            Download All Data
          </button>
          <RestoreData className="inline-flex items-center justify-center rounded font-medium transition-colors border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white px-4 py-2 m-1">
            Restore Previous Download
          </RestoreData>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded font-medium transition-colors border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white px-4 py-2 m-1"
            onClick={handleCsvDownload}
          >
            Download transactions as CSV
          </button>
        </div>
      </div>
      <hr />
      <div className="flex flex-wrap gap-6">
        <div className="w-full md:flex-1">
          <h3>Categories</h3>
          <Categories />
        </div>
        <div className="w-full md:flex-1">
          <h3>Accounts</h3>
          <div>
            <Accounts />
          </div>
          <div className="md:mt-4">
            <Categorizer />
          </div>
        </div>
      </div>
      <Tooltip id="manage-data-tooltip" />
    </>
  );
};

