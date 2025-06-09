import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Category } from '../../types/redux';

interface CategoryGuessConfirmProps {
  transactionId: string;
  categoryGuess: Category;
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
}

/**
 * Controls for confirming or rejecting a category guess.
 */
export default function CategoryGuessConfirm({
  transactionId,
  categoryGuess,
  handleRowCategoryChange
}: CategoryGuessConfirmProps) {
  const confirm = () => {
    handleRowCategoryChange({ [transactionId]: categoryGuess.id });
    
  };

  const reject = () => {
    handleRowCategoryChange({ [transactionId]: '' });
    
  };

  return (
    <React.Fragment>
      <FontAwesomeIcon
        icon="thumbs-up"
        className="text-success mx-1 cursor-pointer"
        onClick={confirm}
        aria-label={`Confirm Guess (${categoryGuess.name})`}
        data-tooltip-content={`Confirm Guess (${categoryGuess.name})`}
        fixedWidth
      />
      <FontAwesomeIcon
        icon="thumbs-down"
        className="text-danger mx-1 cursor-pointer"
        onClick={reject}
        aria-label={`Reject Guess (${categoryGuess.name})`}
        data-tooltip-content={`Reject Guess (${categoryGuess.name})`}
        fixedWidth
      />
      <span className="mx-1">{categoryGuess.name}</span>
      <FontAwesomeIcon
        icon="question-circle"
        className="text-info"
        data-tooltip-content="This is a guess, confirm or reject with the thumbs up or down on the left."
        fixedWidth
      />
    </React.Fragment>
  );
}
