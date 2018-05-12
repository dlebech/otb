import React from 'react';
import { connect } from 'react-redux';
import download from 'downloadjs';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import RestoreData from './RestoreData';
import Categories from './Categories';

class Data extends React.Component {
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
          <div className="col-auto">
            <dl>
              <dt>Number of transactions</dt>
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
            <RestoreData className="btn btn-outline-secondary m-1">
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
        </div>
      </React.Fragment>
    );
  }
};

const mapStateToProps = state => {
  return {
    state,
    numTransactions: state.transactions.data.length
  };
};

export default connect(mapStateToProps)(Data);