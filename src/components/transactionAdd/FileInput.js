import React from 'react';
import PropTypes from 'prop-types';

const FileInput = props => {
  return (
    <div className="form-row">
      <div className="col-auto">
        <label htmlFor="transactions-input">Transactions file (CSV or Excel sheet):</label>
        <input
          type="file"
          id="transactions-input"
          className="form-control-file"
          onChange={props.handleFileChange}
        />
        <small className="form-text text-muted">
          The file is not sent anywhere. It is processed in your browser only.
        </small>
      </div>
    </div>
  );
};

FileInput.propTypes = {
  handleFileChange: PropTypes.func.isRequired
};

export default FileInput;