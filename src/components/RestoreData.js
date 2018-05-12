import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../actions';

class RestoreData extends React.Component {
  constructor(props) {
    super(props);

    this.handleRestoreFile = this.handleRestoreFile.bind(this);
    this.handleRestoreClick = this.handleRestoreClick.bind(this);
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
        <input
          ref={ref => this.fileInput = ref}
          type="file"
          style={{ display: 'none' }}
          onChange={this.handleRestoreFile}
        />
        <button
          type="button"
          className={this.props.className}
          onClick={this.handleRestoreClick}
        >
          {this.props.children}
        </button>
      </React.Fragment>
    );
  }
};

RestoreData.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string.isRequired
};

const mapDispatchToProps = dispatch => {
  return {
    restoreStateFromFile: newState => {
      dispatch(actions.restoreStateFromFile(newState));
    }
  };
};

export default connect(null, mapDispatchToProps)(RestoreData);
