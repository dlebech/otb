import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { show, hide } from 'redux-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../actions';
import Confirm from './modals/Confirm';
import NoData from './NoData';
import TransactionTable from './transactions/TransactionTable';
import NewCategoryForRow from './transactions/NewCategoryForRow';

class Transactions extends React.Component {
  constructor(props) {
    super(props);

    this.handleRowCategory = this.handleRowCategory.bind(this);
    this.handleNewRowCategory = this.handleNewRowCategory.bind(this);
  }

  async handleNewRowCategory(...args) {
    await this.props.hideModal(NewCategoryForRow.modalName);
    this.props.handleNewRowCategory(...args);
  }

  handleRowCategory(rowId, categoryId, categoryName) {
    // A confirmed/rejected category ID or selection in dropdown
    if (categoryId !== null) {
      return this.props.handleRowCategory(rowId, categoryId);
    }

    // A brand new category
    const parentCategories = Object.values(this.props.categories)
      .filter(category => !category.parent);

    this.props.showModal(NewCategoryForRow.modalName, {
      rowId,
      categoryName,
      parentCategories,
      handleNewRowCategory: this.handleNewRowCategory
    });
  }

  render() {
    if (this.props.transactions.length === 0) return <NoData />;

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
              onClick={() => this.props.handleGuessCategories()}
            >
              <FontAwesomeIcon icon="lightbulb" className="mr-1" fixedWidth />
              Guess missing categories
            </button>
          </div>
          <div className="col-auto status">
            {this.props.isCategoryGuessing &&
              <span>
                Guessing categories...
                <FontAwesomeIcon icon="spinner" className="ml-1" pulse />
              </span>
            }
          </div>
        </div>
        <hr />
        <TransactionTable
          transactions={this.props.transactions}
          categories={this.props.categories}
          handleRowCategory={this.handleRowCategory}
          handleDeleteRow={this.props.handleDeleteRow}
          handleIgnoreRow={this.props.handleIgnoreRow}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
        />
        <Confirm />
        <NewCategoryForRow />
      </React.Fragment>
    );
  }
}

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
    handleNewRowCategory: (rowId, categoryName, parentId) => {
      dispatch(actions.addCategoryWithRow(categoryName, parentId, rowId));
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