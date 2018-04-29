import React from 'react';
import { connect } from 'react-redux';
import download from 'downloadjs';
import * as actions from '../actions';

class Data extends React.Component {
  constructor(props) {
    super(props);

    this.handleDownload = this.handleDownload.bind(this);
    this.handleRestoreFile = this.handleRestoreFile.bind(this);
    this.handleRestoreClick = this.handleRestoreClick.bind(this);
  }

  handleDownload() {
    const blob = new Blob([JSON.stringify(this.props.state)], {
      type: 'application/json'
    });
    download(blob, 'data.json', 'application/json');
  }

  handleRestoreFile(e) {
    const reader = new FileReader();

    reader.onload = fe => {
      const newState = JSON.parse(fe.target.result);
      this.props.restoreStateFromFile(newState);
    };

    reader.readAsText(e.target.files[0], 'utf-8');
  }

  handleRestoreClick() {
    this.fileInput.click();
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
              Download All Data
            </button>
            <input
              ref={ref => this.fileInput = ref}
              type="file"
              style={{ display: 'none' }}
              onChange={this.handleRestoreFile}
            />
            <button
              type="button"
              className="btn btn-outline-secondary ml-3"
              onClick={this.handleRestoreClick}
            >
              Restore Previous Download
            </button>
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

const mapDispatchToProps = dispatch => {
  return {
    restoreStateFromFile: newState => {
      dispatch(actions.restoreStateFromFile(newState));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Data);