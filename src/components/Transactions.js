import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import * as actions from '../actions';
import NoData from './NoData';

// XXX: This is not nice :-)
const categories = [
  { key: 'food', name: 'Food' },
  { key: 'travel', name: 'Travel' }
];

/**
 * Controls for confirming or rejecting a category guess.
 */
const CategoryGuessConfirm = props => {
  return (
    <React.Fragment>
      {props.transaction.category.guess}
      <FontAwesomeIcon
        icon="question-circle"
        className="text-info ml-1" 
        data-tip="This is a guess, confirm or edit it on the right"
      />
      <button
        type="button"
        className="btn btn-outline-dark btn-sm ml-1 border-0"
        onClick={() => props.handleRowCategory(props.transaction.id, props.transaction.category.guess)}
        title="Confirm Guess"
      >
        <FontAwesomeIcon icon="thumbs-up" />
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm border-0"
        onClick={() => props.handleRowCategory(props.transaction.id, '')}
        title="Reject guess"
      >
        <FontAwesomeIcon icon="thumbs-down" />
      </button>
      <ReactTooltip />
    </React.Fragment>
  )
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
    return <CategoryGuessConfirm {...props} />;
  }

  if (props.transaction.category.confirmed) {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm border-0"
        onClick={() => props.handleEditCategoryForRow(props.transaction.id)}
      >
        {props.transaction.category.confirmed}
        <FontAwesomeIcon icon="edit" className="ml-1" fixedWidth />
      </button>
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
    >
      <option value=""></option>
      {categories.map(category => {
        return <option
          key={`cat-${props.transaction.id}-${category.key}`}
          value={category.key}
          selected={category.key === props.transaction.category.confirmed}
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
  }).isRequired
};

const RowCategorizer = props => {
  const showSelect = props.transaction.editingCategory ||
    (!props.transaction.category.guess && !props.transaction.category.confirmed);

  return (
    <React.Fragment>
      {!showSelect && <Category
        transaction={props.transaction}
        handleRowCategory={props.handleRowCategory}
        handleEditCategoryForRow={props.handleEditCategoryForRow}
      />}
      {showSelect && <CategorySelect
        transaction={props.transaction}
        handleRowCategory={props.handleRowCategory}
      />}
    </React.Fragment>
  );
}

const TransactionRow = props => {
  return (
    <tr>
      <td>
        {props.transaction.date}
      </td>
      <td>
        {props.transaction.description}
      </td>
      <td>
        {props.transaction.amount}
      </td>
      <td>
        {props.transaction.total}
      </td>
      <td>
        <RowCategorizer {...props} />
      </td>
    </tr>
  );
};

TransactionRow.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired
}

const TransactionTable = props => {
  const data = props.transactions;

  return (
    <div className="row">
      <div className="col">
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Total</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {data.map((transaction, i) => {
              return <TransactionRow
                key={`row-${transaction.id}`}
                transaction={transaction}
                handleRowCategory={props.handleRowCategory}
                handleEditCategoryForRow={props.handleEditCategoryForRow}
              />
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Transactions = props => {
  if (props.transactions.length === 0) return <NoData />;

  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <Link to="/transaction/upload" className="btn btn-outline-primary">
            <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
            Add More Transactions
          </Link>
          <button
            className="btn btn-outline-secondary ml-2"
            onClick={() => {
              const unconfirmedIds = props.transactions
                .filter(t => !t.category.confirmed)
                .map(t => t.id);
              props.handleGuessCategoryForRow(unconfirmedIds);
            }}
          >
            <FontAwesomeIcon icon="lightbulb" className="mr-1" fixedWidth />
            Guess missing categories
          </button>
        </div>
      </div>
      <TransactionTable
        transactions={props.transactions}
        handleRowCategory={props.handleRowCategory}
        handleEditCategoryForRow={props.handleEditCategoryForRow}
      />
    </React.Fragment>
  );
};

Transactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired
}

const mapStateToProps = state => {
  const transactions = state.transactions.data.map(t => {
    return Object.assign({
      editingCategory: state.edit.transactionCategories.has(t.id)
    }, t);
  })
  return { transactions };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRowCategory: (rowId, category) => {
      dispatch(actions.categorizeRow(rowId, category));
    },
    handleGuessCategoryForRow: rowId => {
      dispatch(actions.guessCategoryForRow(rowId));
    },
    handleEditCategoryForRow: rowId => {
      dispatch(actions.editCategoryForRow(rowId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transactions)