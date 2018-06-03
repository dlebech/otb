import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

/**
 * Controls for confirming or rejecting a category guess.
 */
const CategoryGuessConfirm = props => {
  return (
    <React.Fragment>
      <FontAwesomeIcon
        icon="question-circle"
        className="text-info mr-1"
        data-tip="This is a guess, confirm or edit it on the right"
        fixedWidth
      />
      {props.categoryGuess.name}
      <button
        type="button"
        className="btn btn-outline-success btn-sm border-0"
        onClick={() => props.handleRowCategory(props.transactionId, props.categoryGuess.id)}
        aria-label="Confirm Guess"
        data-tip="Confirm Guess"
      >
        <FontAwesomeIcon icon="thumbs-up" fixedWidth />
      </button>
      <button
        type="button"
        className="btn btn-outline-danger btn-sm border-0"
        onClick={() => props.handleRowCategory(props.transactionId, '')}
        aria-label="Reject guess"
        data-tip="Reject guess"
      >
        <FontAwesomeIcon icon="thumbs-down" fixedWidth />
      </button>
    </React.Fragment>
  );
};

CategoryGuessConfirm.propTypes = {
  transactionId: PropTypes.string.isRequired,
  categoryGuess: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  handleRowCategory: PropTypes.func.isRequired
};

export default CategoryGuessConfirm;
