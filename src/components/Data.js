import React from 'react';
import { connect } from 'react-redux';
import download from 'downloadjs';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import RestoreData from './RestoreData';

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
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={this.handleDownload}
            >
              <FontAwesomeIcon icon="download" className="mr-1" fixedWidth />
              Download All Data
            </button>
            <RestoreData>
              Restore Previous Download
            </RestoreData>
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