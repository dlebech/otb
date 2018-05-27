import React from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

/**
 * Controls for confirming or rejecting a category guess.
 */
const CategoryGuessConfirm = props => {
  return (
    <React.Fragment>
      {props.categoryGuessName}
      <FontAwesomeIcon
        icon="question-circle"
        className="text-info ml-1" 
        data-tip="This is a guess, confirm or edit it on the right"
      />
      <button
        type="button"
        className="btn btn-outline-success btn-sm ml-1 border-0"
        onClick={() => props.handleRowCategory(props.transactionId, props.categoryGuess)}
        title="Confirm Guess"
      >
        <FontAwesomeIcon icon="thumbs-up" />
      </button>
      <button
        type="button"
        className="btn btn-outline-danger btn-sm border-0"
        onClick={() => props.handleRowCategory(props.transactionId, '')}
        title="Reject guess"
      >
        <FontAwesomeIcon icon="thumbs-down" />
      </button>
    </React.Fragment>
  );
};

/**
 * Showing a confirmed or guessed category.
 */
const Category = props => {
  // 1. If the category has a guess, show that, as well as controls for
  // confirming the guess.
  // 2. If the category is confirmed, show an edit button
  // 3. Otherwise show nothing.
  if (props.transaction.category.guess) {
    const categoryName = props.categories
      .find(c => c.id === props.transaction.category.guess)
      .name;
    return <CategoryGuessConfirm
      transactionId={props.transaction.id}
      categoryGuess={props.transaction.category.guess}
      categoryGuessName={categoryName}
      handleRowCategory={props.handleRowCategory}
    />;
  }

  if (props.transaction.category.confirmed) {
    const categoryName = props.categories
      .find(c => c.id === props.transaction.category.confirmed)
      .name;
    return (
      <span
        className="cursor-pointer"
        onClick={() => props.handleEditCategoryForRow(props.transaction.id)}
      >
        {categoryName}
        <FontAwesomeIcon icon="edit" className="ml-1" fixedWidth />
      </span>
    );
  }

  return null;
};

Category.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  handleEditCategoryForRow: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    category: PropTypes.shape({
      guess: PropTypes.string,
      confirmed: PropTypes.string
    }).isRequired
  }).isRequired
};

/**
 * A select list for choosing a category.
 */
const CategorySelect = props => {
  return (
    <select
      className="form-control"
      onChange={e => props.handleRowCategory(props.transaction.id, e.target.value)}
      value={props.transaction.category.confirmed}
    >
      <option value=""></option>
      {props.categories.map(category => {
        return <option
          key={`cat-${props.transaction.id}-${category.id}`}
          value={category.id}
        >
          {category.name}
        </option>
      })}
    </select>
  );
};

CategorySelect.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired
};

const RowCategorizer = props => {
  const showSelect = props.transaction.editingCategory ||
    (!props.transaction.category.guess && !props.transaction.category.confirmed);

  return (
    <React.Fragment>
      {!showSelect && <Category
        transaction={props.transaction}
        categories={props.categories}
        handleRowCategory={props.handleRowCategory}
        handleEditCategoryForRow={props.handleEditCategoryForRow}
      />}
      {showSelect && <CategorySelect
        transaction={props.transaction}
        categories={props.categories}
        handleRowCategory={props.handleRowCategory}
      />}
    </React.Fragment>
  );
};

RowCategorizer.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  handleEditCategoryForRow: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    category: PropTypes.shape({
      guess: PropTypes.string,
      confirmed: PropTypes.string
    }).isRequired,
    editingCategory: PropTypes.bool.isRequired
  }).isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired
};

export default RowCategorizer;
