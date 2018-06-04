import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { show, hide } from 'redux-modal';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import * as actions from '../actions';
import Confirm from './modals/Confirm';
import NoData from './NoData';
import TransactionTable from './transactions/TransactionTable';

const Transactions = props => {
  if (props.transactions.length === 0) return <NoData />;

  return (
    <React.Fragment>
      <div className="row align-items-center">
        <div className="col-auto">
          <Link to="/transaction/upload" className="btn btn-outline-primary">
            <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
            Add More Transactions
          </Link>
          <button
            className="btn btn-outline-secondary ml-2"
            onClick={() => props.handleGuessCategories()}
          >
            <FontAwesomeIcon icon="lightbulb" className="mr-1" fixedWidth />
            Guess missing categories
          </button>
        </div>
        <div className="col-auto status">
          {props.isCategoryGuessing &&
            <span>
              Guessing categories...
              <FontAwesomeIcon icon="spinner" className="ml-1" pulse />
            </span>
          }
        </div>
      </div>
      <hr />
      <TransactionTable
        transactions={props.transactions}
        categories={props.categories}
        handleRowCategory={props.handleRowCategory}
        handleDeleteRow={props.handleDeleteRow}
        handleIgnoreRow={props.handleIgnoreRow}
        showModal={props.showModal}
        hideModal={props.hideModal}
      />
      <Confirm />
    </React.Fragment>
  );
};

Transactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  categories: PropTypes.object.isRequired,
  isCategoryGuessing: PropTypes.bool.isRequired
}

const mapStateToProps = state => {
  const categories = state.categories.data.reduce((obj, category) => {
    obj[category.id] = category;
    return obj;
  }, {});

  const transactions = state.transactions.data.map(t => {
    return {
      categoryGuess: categories[t.category.guess] || null,
      categoryConfirmed: categories[t.category.confirmed] || null,
      ...t,
      date: moment(t.date)
    };
  });

  return {
    transactions,
    categories,
    isCategoryGuessing: state.app.isCategoryGuessing
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleRowCategory: (rowId, categoryId) => {
      dispatch(actions.categorizeRow(rowId, categoryId));
      if (categoryId) dispatch(actions.guessAllCategories());
    },
    handleGuessCategories: () => {
      dispatch(actions.guessAllCategories())
    },
    handleDeleteRow: rowId => {
      dispatch(actions.deleteRow(rowId));
    },
    handleIgnoreRow: (rowId, ignore) => {
      dispatch(actions.ignoreRow(rowId, ignore));
    },
    showModal: (...args) => {
      dispatch(show(...args));
    },
    hideModal: (...args) => {
      dispatch(hide(...args));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transactions)