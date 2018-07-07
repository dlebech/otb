import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IgnoreTransaction = props => {
  if (!props.isIgnored) {
    return (
      <FontAwesomeIcon
        icon="ban"
        className="cursor-pointer"
        data-tip="Ignore row in charts. This is useful if the transaction is not actually an income or expense, e.g. transfers between accounts"
        onClick={() => props.handleIgnoreRow(props.transactionId, true)}
        fixedWidth
      />
    );
  }

  return (
    <FontAwesomeIcon
      icon="plus"
      className="cursor-pointer"
      data-tip="Include row in charts."
      onClick={() => props.handleIgnoreRow(props.transactionId, false)}
      fixedWidth
    />
  );
};

IgnoreTransaction.propTypes = {
  transactionId: PropTypes.string.isRequired,
  isIgnored: PropTypes.bool.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired
};

export default IgnoreTransaction;
