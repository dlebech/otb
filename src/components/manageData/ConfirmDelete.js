import React from 'react';
import PropTypes from 'prop-types';

const ConfirmDelete = props => {
  return (
    <React.Fragment>
      {props.numTransactions > 0 && <div className="alert alert-danger">
        Deleting &quot;{props.nameToDelete}&quot; will affect {props.numTransactions} transactions.
        These transactions will be reset for &quot;{props.nameToDelete}&quot;.
      </div>}
      Are you sure you want to delete &quot;{props.nameToDelete}&quot;?
    </React.Fragment>
  );
};

ConfirmDelete.propTypes = {
  nameToDelete: PropTypes.string.isRequired,
  numTransactions: PropTypes.number
};

export default ConfirmDelete;