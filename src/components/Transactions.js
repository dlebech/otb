import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../actions';
import NoData from './NoData';

// XXX: This is not nice :-)
const categories = [
  { key: 'food', name: 'Food' },
  { key: 'travel', name: 'Travel' }
];

const CategoryGuess = props => {
  if (props.transaction.category.guess) return props.transaction.category.guess;
  // XXX: Should probably not be a manual process, but it works for now.
  return (
    <button
      type="button"
      onClick={() => props.handleGuessCategoryForRow(props.transaction.id)}
    >
      Guess!
    </button>
  )
};

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
        >
          {category.name}
        </option>
      })}
    </select>
  );
};

CategorySelect.propTypes = {
  handleRowCategory: PropTypes.func.isRequired
};

const RowCategorizer = props => {
  if (props.transaction.category.confirmed) return props.transaction.category.confirmed;
  return (
    <React.Fragment>
      <CategoryGuess {...props} />
      <CategorySelect {...props} />
    </React.Fragment>
  );
};

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
    <div className="row justify-content-center">
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
                handleGuessCategoryForRow={props.handleGuessCategoryForRow}
              />
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Transactions = props => {
  if (props.transactions.length === 0) return <NoData />;

  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <Link to="/transaction/upload" className="btn btn-outline-primary">Add More Transactions</Link>
        </div>
      </div>
      <TransactionTable
        transactions={props.transactions}
        handleRowCategory={props.handleRowCategory}
        handleGuessCategoryForRow={props.handleGuessCategoryForRow}
      />
    </React.Fragment>
  );
};

Transactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired
}

const mapStateToProps = state => {
  return {
    transactions: state.transactions.data,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRowCategory: (rowId, category) => {
      dispatch(actions.categorizeRow(rowId, category));
    },
    handleGuessCategoryForRow: rowId => {
      dispatch(actions.guessCategoryForRow(rowId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transactions)