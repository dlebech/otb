import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { show, hide } from 'redux-modal';
import { createSearchAction } from 'redux-search'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash/debounce';
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
    if (!this.props.hasTransactions) return <NoData />;

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
          handleSearch={this.props.handleSearch}
          handleDatesChange={this.props.handleDatesChange}
          handlePageChange={this.props.handlePageChange}
          handlePageSizeChange={this.props.handlePageSizeChange}
          handleSortChange={this.props.handleSortChange}
          handleFilterCategories={this.props.handleFilterCategories}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
          {...this.props.transactionListSettings}
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

  let transactions = state.transactions.data;
  if (state.search.transactions.result.length !== state.transactions.data) {
    const ids = new Set(state.search.transactions.result);
    transactions = transactions.filter(t => ids.has(t.id));
  }

  transactions = transactions.map(t => {
    return {
      categoryGuess: categories[t.category.guess] || null,
      categoryConfirmed: categories[t.category.confirmed] || null,
      ...t,
      date: moment(t.date)
    };
  });

  const dateSelectId = 'transaction-dates';
  const dateSelect = state.edit.dateSelect[dateSelectId] || {
    startDate: null,
    endDate: null
  };
  dateSelect.id = dateSelectId;

  return {
    transactions,
    categories,
    isCategoryGuessing: state.app.isCategoryGuessing,
    hasTransactions: state.transactions.data.length > 0,
    transactionListSettings: {
      searchText: state.search.transactions.text,
      dateSelect,
      ...state.edit.transactionList
    }
  };
};

const searchTransactions = createSearchAction('transactions');

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
    },
    handleSearch: debounce(text => {
      dispatch(searchTransactions(text));
    }, 250),
    handleDatesChange: (dateSelectId, startDate, endDate) => {
      dispatch(actions.editDates(dateSelectId, startDate, endDate));
    },
    handlePageChange: page => {
      dispatch(actions.setTransactionListPage(page));
    },
    handlePageSizeChange: (pageSize, numTransactions) => {
      dispatch(actions.setTransactionListPageSize(pageSize, numTransactions));
    },
    handleSortChange: (sortKey, sortAscending) => {
      dispatch(actions.setTransactionListSort(sortKey, sortAscending));
    },
    handleFilterCategories: (filterCategories, numTransactions) => {
      dispatch(actions.setTransactionListFilterCategories(filterCategories, numTransactions));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transactions)