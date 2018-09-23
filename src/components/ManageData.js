import React from 'react';
import { connect } from 'react-redux';
import download from 'downloadjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RestoreData from './manageData/RestoreData';
import Categories from './manageData/Categories';
import Accounts from './manageData/Accounts';

class ManageData extends React.Component {
  constructor(props) {
    super(props);

    this.handleDownload = this.handleDownload.bind(this);
  }

  handleDownload() {
    const blob = new Blob([JSON.stringify(this.props.state)], {
      type: 'application/json'
    });
    download(blob, 'data.json', 'application/json');
  }

  render() {
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }
};

const mapStateToProps = state => {
  const categorized = state.transactions.data.filter(t => !!t.category.confirmed).length;
  const uncategorized = state.transactions.data.length - categorized;

  return {
    state,
    numTransactions: state.transactions.data.length,
    numTransactionsCategorized: categorized,
    numTransactionsUncategorized: uncategorized
  };
};

export default connect(mapStateToProps)(ManageData);