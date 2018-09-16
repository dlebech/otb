import React from 'react';
import { connect } from 'react-redux';
import download from 'downloadjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../actions';
import RestoreData from './manageData/RestoreData';
import CurrencySelect from './shared/CurrencySelect';
import Categories from './Categories';

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
          <div className="col-md-6">
            <div className="row">
              <div className="col-auto">
                <dl>
                  <dt>Categorized transactions</dt>
                  <dd>{this.props.numTransactionsCategorized}</dd>
                  <dt>Uncategorized transactions</dt>
                  <dd>{this.props.numTransactionsUncategorized}</dd>
                  <dt>Total transactions</dt>
                  <dd>{this.props.numTransactions}</dd>
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
          </div>
          <div className="col-md-6">
            <CurrencySelect onChange={this.props.setDefaultCurrency} />
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col">
            <h3>Categories</h3>
            <Categories />
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

const mapDispatchToProps = dispatch => {
  return {
    setDefaultCurrency: currency => {
      dispatch(actions.setDefaultCurrency(currency));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageData);