import React from 'react';
import PropTypes from 'prop-types';

const UploadForm = props => {
  return (
    <form>
      {!props.hasTransactions && <div className="form-row">
        <div className="col-auto">
          <label htmlFor="transactions-input">Transactions file:</label>
          <input
            type="file"
            id="transactions-input"
            className="form-control-file"
            onChange={props.handleFileChange}
          />
        </div>
      </div>}
      {props.hasTransactions &&
      <div className="form-row my-2">
        <label htmlFor="skip-rows" className="col-form-label">Rows To Skip:</label>
        <div className="col-auto">
          <input
            type="number"
            id="skip-rows"
            className="form-control"
            onChange={props.handleSkipRowsChange}
            min="0"
            value={props.skipRows}
          />
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-primary" onClick={props.handleSave}>
            Save
          </button>
          <button type="button" className="btn btn-secondary ml-2" onClick={props.handleCancel}>
            Cancel
          </button>
        </div>
      </div>}
    </form>
  );
};

UploadForm.propTypes = {
  hasTransactions: PropTypes.bool.isRequired,
  skipRows: PropTypes.number.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default UploadForm;