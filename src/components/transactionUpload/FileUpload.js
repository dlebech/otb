import React from 'react';
import PropTypes from 'prop-types';

const FileUpload = props => {
  return (
    <div className="form-row">
      <div className="col-auto">
        <label htmlFor="transactions-input">Transactions file:</label>
        <input
          type="file"
          id="transactions-input"
          className="form-control-file"
          onChange={props.handleFileChange}
        />
      </div>
    </div>
  );
};

FileUpload.propTypes = {
  handleFileChange: PropTypes.func.isRequired
};

export default FileUpload;