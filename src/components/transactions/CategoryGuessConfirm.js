import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Controls for confirming or rejecting a category guess.
 */
const CategoryGuessConfirm = props => {
  const confirm = () => {
    props.handleRowCategoryChange(props.transactionId, props.categoryGuess.id);
    ReactTooltip.hide();
  };

  const reject = () => {
    props.handleRowCategoryChange(props.transactionId, '');
    ReactTooltip.hide();
  };

  return (
    <React.Fragment>
      <FontAwesomeIcon
        icon="thumbs-up"
        className="text-success mx-1 cursor-pointer"
        onClick={confirm}
        aria-label={`Confirm Guess (${props.categoryGuess.name})`}
        data-tip={`Confirm Guess (${props.categoryGuess.name})`}
        fixedWidth
      />
      <FontAwesomeIcon
        icon="thumbs-down"
        className="text-danger mx-1 cursor-pointer"
        onClick={reject}
        aria-label={`Reject Guess (${props.categoryGuess.name})`}
        data-tip={`Reject Guess (${props.categoryGuess.name})`}
        fixedWidth
      />
      <span className="mx-1">{props.categoryGuess.name}</span>
      <FontAwesomeIcon
        icon="question-circle"
        className="text-info"
        data-tip="This is a guess, confirm or reject with the thumbs up or down on the left."
        fixedWidth
      />
    </React.Fragment>
  );
};

CategoryGuessConfirm.propTypes = {
  transactionId: PropTypes.string.isRequired,
  categoryGuess: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  handleRowCategoryChange: PropTypes.func.isRequired
};

export default CategoryGuessConfirm;
