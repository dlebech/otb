import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import CategoryGuessConfirm from './CategoryGuessConfirm';

/**
 * Showing a confirmed or guessed category.
 */
const Category = props => {
  // 1. If the category has a guess, show that, as well as controls for
  // confirming the guess.
  // 2. If the category is confirmed, show an edit button
  // 3. Otherwise show nothing.
  if (props.categoryGuess) {
    return <CategoryGuessConfirm
      transactionId={props.transactionId}
      categoryGuess={props.categoryGuess}
      handleRowCategory={props.handleRowCategory}
    />;
  }

  if (props.categoryConfirmed) {
    return (
      <span
        className="cursor-pointer"
        onClick={() => props.handleEditCategoryForRow(props.transactionId)}
      >
        {props.categoryConfirmed.name}
        <FontAwesomeIcon icon="edit" className="ml-1" fixedWidth />
      </span>
    );
  }

  return null;
};

Category.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  handleEditCategoryForRow: PropTypes.func.isRequired,
  transactionId: PropTypes.string.isRequired,
  categoryGuess: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  categoryConfirmed: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })
};

export default Category;
