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

    this.handleRowCategoryChange = this.handleRowCategoryChange.bind(this);
    this.handleNewRowCategory = this.handleNewRowCategory.bind(this);
    this.showCreateCategoryModal = this.showCreateCategoryModal.bind(this);
  }

  async handleNewRowCategory(rowId, name, parentId) {
    await this.props.hideModal(NewCategoryForRow.modalName);
    this.props.handleNewRowCategory(rowId, name, parentId);
  }

  handleRowCategoryChange(rowIdOrMapping, categoryId) {
    // A mapping of rows to categories.
    if (typeof rowIdOrMapping === 'object') {
      return this.props.handleRowCategoriesChange(rowIdOrMapping);
    };

    // A confirmed/rejected category ID or selection in dropdown
    if (categoryId !== null) {
      return this.props.handleRowCategoryChange(rowIdOrMapping, categoryId);
    }
  }

  showCreateCategoryModal(categoryName, rowId = null) {
    const parentCategories = Object.values(this.props.categories)
      .filter(category => !category.parent);

    this.props.showModal(NewCategoryForRow.modalName, {
      categoryName,
      rowId,
      parentCategories,
      handleNewRowCategory: this.handleNewRowCategory
    });
  }

  render() {
    if (!this.props.hasTransactions) return <NoData />;

    return (
      <>
        <div className="row align-items-center">
          <div className="col-auto">
            <Link to="/transactions/upload" className="btn btn-outline-primary">
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
          transactionGroups={this.props.transactionGroups}
          categories={this.props.categories}
          accounts={this.props.accounts}
          handleRowCategoryChange={this.handleRowCategoryChange}
          handleDeleteRow={this.props.handleDeleteRow}
          handleIgnoreRow={this.props.handleIgnoreRow}
          handleGroupRows={this.props.handleGroupRows}
          handleSearch={this.props.handleSearch}
          handleDatesChange={this.props.handleDatesChange}
          handlePageChange={this.props.handlePageChange}
          handlePageSizeChange={this.props.handlePageSizeChange}
          handleSortChange={this.props.handleSortChange}
          handleFilterCategories={this.props.handleFilterCategories}
          handleRoundAmount={this.props.handleRoundAmount}
          handleDeleteTransactionGroup={this.props.handleDeleteTransactionGroup}
          showCreateCategoryModal={this.showCreateCategoryModal}
          showModal={this.props.showModal}
          hideModal={this.props.hideModal}
          {...this.props.transactionListSettings}
        />
        <Confirm />
        <NewCategoryForRow />
      </>
    );
  }
}

Transactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  categories: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  isCategoryGuessing: PropTypes.bool.isRequired
}

const mapStateToProps = state => {
  const categories = state.categories.data.reduce((obj, category) => {
    obj[category.id] = category;
    return obj;
  }, {});

  let transactions = state.transactions.data
    .map(t => {
      return {
        categoryGuess: categories[t.category.guess] || null,
        categoryConfirmed: categories[t.category.confirmed] || null,
        ...t,
        date: moment(t.date)
      };
    });

  const reverseTransactionLookup = transactions.reduce((obj, t, i) =>{
    obj[t.id] = i;
    return obj;
  }, {});

  // Create an ID -> transactions mapping for easier tooltip'ing.
  const transactionGroups = Object.entries(state.transactions.groups || {})
    .reduce((obj, [groupId, group]) => {
      obj[group.primaryId] = {
        groupId,
        linkedTransactions: group.linkedIds.map(id => transactions[reverseTransactionLookup[id]])
      }
      group.linkedIds.forEach(id => {
        obj[id] = {
          groupId,
          linkedTransactions: [
            transactions[reverseTransactionLookup[group.primaryId]],
            ...group.linkedIds
              .filter(innerId => innerId !== id)
              .map(innerId => transactions[reverseTransactionLookup[innerId]])
          ]
        }
      });
      return obj;
    }, {});

  if (state.search.transactions.result.length !== transactions.length) {
    const ids = new Set(state.search.transactions.result);
    transactions = transactions.filter(t => ids.has(t.id));
  }

  const accounts = state.accounts.data.reduce((obj, account) => {
    obj[account.id] = account;
    return obj;
  }, {});

  const dateSelectId = 'transaction-dates';
  const dateSelect = state.edit.dateSelect[dateSelectId] || {
    startDate: null,
    endDate: null
  };
  dateSelect.id = dateSelectId;

  return {
    transactions,
    categories,
    accounts,
    transactionGroups,
    isCategoryGuessing: state.edit.isCategoryGuessing,
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
    handleRowCategoryChange: (rowId, categoryId) => {
      dispatch(actions.categorizeRow(rowId, categoryId));
      if (categoryId) dispatch(actions.guessAllCategories());
    },
    handleRowCategoriesChange: rowCategoryMapping => {
      dispatch(actions.categorizeRows(rowCategoryMapping));
      if (Object.values(rowCategoryMapping).filter(c => !!c).length > 0) dispatch(actions.guessAllCategories());
    },
    handleNewRowCategory: (rowId, categoryName, parentId) => {
      if (rowId) dispatch(actions.addCategoryWithRow(categoryName, parentId, rowId));
      else dispatch(actions.addCategory(categoryName, parentId));
    },
    handleGuessCategories: () => {
      dispatch(actions.guessAllCategories())
    },
    handleDeleteRow: rowId => {
      dispatch(actions.deleteTransaction(rowId));
    },
    handleIgnoreRow: (rowId, ignore) => {
      dispatch(actions.ignoreTransaction(rowId, ignore));
    },
    handleGroupRows: rowIds => {
      dispatch(actions.groupTransactions(rowIds));
    },
    handleDeleteTransactionGroup: transactionGroupId => {
      dispatch(actions.deleteTransactionGroup(transactionGroupId));
    },
    showModal: (...args) => {
      dispatch(show(...args));
    },
    hideModal: (...args) => {
      dispatch(hide(...args));
    },
    handleSearch: debounce((text, currentPage) => {
      // This is the simplest version for making sure that we don't get stuck on
      // a non-existant page.
      if (currentPage !== 1) dispatch(actions.setTransactionListPage(1));
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
    },
    handleRoundAmount: enabled => {
      dispatch(actions.setTransactionListRoundAmount(enabled));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transactions)