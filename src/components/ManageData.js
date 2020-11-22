import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RestoreData from './manageData/RestoreData';
import Categories from './manageData/Categories';
import Accounts from './manageData/Accounts';
import * as actions from '../actions';
import { arrayToObjectLookup } from '../util';

class ManageData extends React.Component {
  constructor(props) {
    super(props);

    this.handleDownload = this.handleDownload.bind(this);
    this.handleCsvDownload = this.handleCsvDownload.bind(this);
    this.handleSetAccountOnTransactions = this.handleSetAccountOnTransactions.bind(this);
  }

  async handleDownload() {
    const [whitelist, download] = await Promise.all([
      import('../configureStore').then(m => m.persistConfig.whitelist),
      import('downloadjs').then(m => m.default)
    ]);

    // Include only whitelisted store items.
    const stateToDownload = {};
    whitelist.forEach(w => stateToDownload[w] = this.props.state[w]);

    // Create a data blog and download it.
    const blob = new Blob([JSON.stringify(stateToDownload)], {
      type: 'application/json'
    });
    download(blob, 'data.json', 'application/json');
  }

  async handleCsvDownload() {
    const [Papa, download] = await Promise.all([
      import('papaparse').then(m => m.default),
      import('downloadjs').then(m => m.default)
    ]);

    const accounts = arrayToObjectLookup(this.props.state.accounts.data);
    const categories = arrayToObjectLookup(this.props.state.categories.data);
    const lines = this.props.state.transactions.data.map(t => {
      const line = [
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
    lines.sort((a, b) => a[1].localeCompare(b[1]));

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
  }

  handleSetAccountOnTransactions() {
    this.props.handleSetAccountOnTransactions(this.props.state.accounts.data[0].id);
  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col">
            <dl className="row">
              <dt className="col-auto">Total transactions:</dt>
              <dd className="col-auto">{this.props.numTransactions}</dd>
              <dt className="col-auto">Categorized:</dt>
              <dd className="col-auto">{this.props.numTransactionsCategorized}</dd>
              <dt className="col-auto">Uncategorized:</dt>
              <dd className="col-auto">{this.props.numTransactionsUncategorized}</dd>
            </dl>
          </div>
        </div>
        {this.props.numTransactionsWithoutAccount > 0 && <div className="row">
          <div className="col-auto alert alert-warning">
            <p>
              <strong>Transactions without an account:</strong> {this.props.numTransactionsWithoutAccount}
            </p>
            <button
              type="button"
              id="set-account-on-transactions"
              className="btn btn-primary"
              onClick={this.handleSetAccountOnTransactions}
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
              onClick={this.handleDownload}
            >
              <FontAwesomeIcon icon="download" className="mr-1" fixedWidth />
              Download All Data
            </button>
            <RestoreData className="btn btn-outline-secondary m-1" persistor={this.props.persistor}>
              Restore Previous Download
            </RestoreData>
            <button
              type="button"
              className="btn btn-outline-secondary m-1"
              onClick={this.handleCsvDownload}
            >
              Download transactions as CSV
            </button>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col">
            <h3>Categories</h3>
            <Categories />
          </div>
          <div className="col">
            <h3>Accounts</h3>
            <Accounts />
          </div>
        </div>
        <ReactTooltip />
      </>
    );
  }
};

const mapStateToProps = state => {
  let categorized = 0;
  let withoutAccount = 0;
  state.transactions.data.forEach(t => {
    if (!!t.category.confirmed) categorized++;
    if (!t.account) withoutAccount++;
  });
  const uncategorized = state.transactions.data.length - categorized;

  return {
    state,
    numTransactions: state.transactions.data.length,
    numTransactionsCategorized: categorized,
    numTransactionsUncategorized: uncategorized,
    numTransactionsWithoutAccount: withoutAccount
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleSetAccountOnTransactions: accountId => {
      dispatch(actions.setEmptyTransactionsAccount(accountId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageData);