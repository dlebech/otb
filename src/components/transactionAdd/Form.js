import React from 'react';
import PropTypes from 'prop-types';
import FileInput from './FileInput';
import ImportControls from './ImportControls';

const Form = props => {
  return (
    <form>
      {!props.hasTransactions && <FileInput handleFileChange={props.handleFileChange} />}
      {props.hasTransactions && <ImportControls
        skipRows={props.skipRows}
        skipDuplicates={props.skipDuplicates}
        handleSkipRowsChange={props.handleSkipRowsChange}
        handleSkipDuplicatesChange={props.handleSkipDuplicatesChange}
        handleSave={props.handleSave}
        handleCancel={props.handleCancel}
        handleAccountChange={props.handleAccountChange}
        accounts={props.accounts}
        selectedAccount={props.selectedAccount}
      />}
    </form>
  );
};

Form.propTypes = {
  hasTransactions: PropTypes.bool.isRequired,
  skipRows: PropTypes.number.isRequired,
  skipDuplicates: PropTypes.bool.isRequired,
  handleFileChange: PropTypes.func.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSkipDuplicatesChange: PropTypes.func.isRequired,
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

Form.defaultProps = {
  selectedAccount: ''
};

export default Form;