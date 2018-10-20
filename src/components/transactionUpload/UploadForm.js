import React from 'react';
import PropTypes from 'prop-types';
import FileUpload from './FileUpload';
import ImportControls from './ImportControls';

const UploadForm = props => {
  return (
    <form>
      {!props.hasTransactions && <FileUpload handleFileChange={props.handleFileChange} />}
      {props.hasTransactions && <ImportControls
        skipRows={props.skipRows}
        handleSkipRowsChange={props.handleSkipRowsChange}
        handleSave={props.handleSave}
        handleCancel={props.handleCancel}
        handleAccountChange={props.handleAccountChange}
        accounts={props.accounts}
        selectedAccount={props.selectedAccount}
      />}
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
  handleAccountChange: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  })).isRequired,
  selectedAccount: PropTypes.string
};

UploadForm.defaultProps = {
  selectedAccount: ''
};

export default UploadForm;