import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RestoreData from './manageData/RestoreData';
import Categories from './manageData/Categories';
import Accounts from './manageData/Accounts';
import * as actions from '../actions';

class ManageData extends React.Component {
  constructor(props) {
    super(props);

    this.handleDownload = this.handleDownload.bind(this);
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