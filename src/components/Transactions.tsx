import React, { useCallback, useState, useRef } from 'react';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../types/redux';
import Link from 'next/link';
import { createSearchAction } from 'redux-search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash/debounce';
import * as actions from '../actions';
import { RootState } from '../reducers';
import NoData from './NoData';
import TransactionTable from './transactions/TransactionTable';
import NewCategoryForRow from './transactions/NewCategoryForRow';
import { arrayToObjectLookup } from '../util';

const searchTransactions = createSearchAction('transactions');

export default function Transactions() {
  const dispatch = useDispatch<AppDispatch>();
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryTransactionId, setNewCategoryTransactionId] = useState('');
  
  const {
    transactions,
    categories,
    accounts,
    transactionGroups,
    parentCategories,
    isCategoryGuessing,
    hasTransactions,
    transactionListSettings
  } = useSelector((state: RootState) => {
    const categoriesObj = state.categories.data.reduce((obj: any, category: any) => {
      obj[category.id] = category;
      return obj;
    }, {});

    let transactionsData = state.transactions.data
      .map((t: any) => {
        return {
          categoryGuess: categoriesObj[t.category.guess] || null,
          categoryConfirmed: categoriesObj[t.category.confirmed] || null,
          ...t,
          date: moment(t.date)
        };
      });

    const reverseTransactionLookup = transactionsData.reduce((obj: any, t: any, i: number) => {
      obj[t.id] = i;
      return obj;
    }, {});

    // Create an ID -> transactions mapping for easier tooltip'ing.
    const transactionGroupsObj = Object.entries(state.transactions.groups || {})
      .reduce((obj: any, [groupId, group]: [string, any]) => {
        obj[group.primaryId] = {
          groupId,
          linkedTransactions: group.linkedIds.map((id: string) => transactionsData[reverseTransactionLookup[id]])
        };
        group.linkedIds.forEach((id: string) => {
          obj[id] = {
            groupId,
            linkedTransactions: [
              transactionsData[reverseTransactionLookup[group.primaryId]],
              ...group.linkedIds
                .filter((innerId: string) => innerId !== id)
                .map((innerId: string) => transactionsData[reverseTransactionLookup[innerId]])
            ]
          };
        });
        return obj;
      }, {});

    if (state.search.transactions.result.length !== transactionsData.length) {
      const ids = new Set(state.search.transactions.result);
      transactionsData = transactionsData.filter((t: any) => ids.has(t.id));
    }

    const accountsObj = arrayToObjectLookup(state.accounts.data);

    const dateSelectId = 'transaction-dates';
    const rawDateSelect = state.edit.dateSelect[dateSelectId] || {
      startDate: null,
      endDate: null
    };
    
    const dateSelect = {
      startDate: rawDateSelect.startDate ? moment(rawDateSelect.startDate) : null,
      endDate: rawDateSelect.endDate ? moment(rawDateSelect.endDate) : null,
      id: dateSelectId
    };

    // Get parent categories for the modal
    const parentCategories = state.categories.data.filter((c: any) => !c.parent);

    return {
      transactions: transactionsData,
      categories: categoriesObj,
      accounts: accountsObj,
      transactionGroups: transactionGroupsObj,
      parentCategories,
      isCategoryGuessing: state.edit.isCategoryGuessing,
      hasTransactions: state.transactions.data.length > 0,
      transactionListSettings: {
        searchText: state.search.transactions.text,
        dateSelect,
        ...state.edit.transactionList
      }
    };
  });

  const handleNewRowCategory = useCallback(async (rowId: string, name: string, parentId: string) => {
    if (rowId) {
      // Create a thunk that handles the category creation and transaction categorization
      const createCategoryAndCategorizeTransaction = (): any => {
        return (dispatch: any, getState: any) => {
          // First add the category
          dispatch(actions.addCategory(name, parentId));
          
          // Get the newly created category from the updated state
          const state = getState();
          const newCategory = state.categories.data
            .filter((c: any) => c.name === name && c.parent === parentId)
            .sort((a: any, b: any) => b.id.localeCompare(a.id))[0]; // Get the most recent one
          
          if (newCategory) {
            // Then categorize the transaction with the new category
            dispatch(actions.categorizeRow(rowId, newCategory.id));
          }
        };
      };
      
      dispatch(createCategoryAndCategorizeTransaction());
    } else {
      dispatch(actions.addCategory(name, parentId));
    }
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryTransactionId('');
  }, [dispatch]);

  const handleRowCategoryChange = useCallback(async (rowIdOrMapping: string | object, categoryId?: string) => {
    // A mapping of rows to categories.
    if (typeof rowIdOrMapping === 'object') {
      await dispatch(actions.categorizeRows(rowIdOrMapping));
      if (Object.values(rowIdOrMapping).filter((c: any) => !!c).length > 0) {
        dispatch(actions.guessAllCategories());
      }
      return;
    }

    // A confirmed/rejected category ID or selection in dropdown
    if (categoryId !== null && categoryId !== undefined) {
      await dispatch(actions.categorizeRow(rowIdOrMapping as string, categoryId));
      if (categoryId) {
        dispatch(actions.guessAllCategories());
      }
      return;
    }
  }, [dispatch]);

  const showCreateCategoryModal = useCallback((name: string, transactionId: string) => {
    setNewCategoryName(name);
    setNewCategoryTransactionId(transactionId);
    setShowNewCategoryModal(true);
  }, []);

  const handleGuessCategories = useCallback(() => {
    dispatch(actions.guessAllCategories());
  }, [dispatch]);

  const handleDeleteRow = useCallback((rowId: string) => {
    dispatch(actions.deleteTransaction(rowId));
  }, [dispatch]);

  // Modified to match expected prop type from TransactionTable
  const handleIgnoreRow = useCallback((rowId: string, ignore: boolean) => {
    dispatch(actions.ignoreTransaction(rowId, ignore));
  }, [dispatch]);

  const handleGroupRows = useCallback((rowIds: string[]) => {
    dispatch(actions.groupTransactions(rowIds));
  }, [dispatch]);

  const handleDeleteTransactionGroup = useCallback((transactionGroupId: string) => {
    dispatch(actions.deleteTransactionGroup(transactionGroupId));
  }, [dispatch]);

  const debouncedSearchRef = useRef(
    debounce((text: string, currentPage: number) => {
      // This is the simplest version for making sure that we don't get stuck on
      // a non-existant page.
      if (currentPage !== 1) dispatch(actions.setTransactionListPage(1));
      dispatch(searchTransactions(text));
    }, 300)
  );

  const handleSearch = useCallback((text: string, currentPage: number) => {
    debouncedSearchRef.current(text, currentPage);
  }, []);

  const handleDatesChange = useCallback((_id: string, startDate: any, endDate: any) => {
    dispatch(actions.editDates('transaction-dates',
      startDate ? startDate.toISOString() : null,
      endDate ? endDate.toISOString() : null
    ));
  }, [dispatch]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(actions.setTransactionListPage(page));
  }, [dispatch]);

  const handlePageSizeChange = useCallback((pageSize: number, numTransactions: number) => {
    dispatch(actions.setTransactionListPageSize(pageSize, numTransactions));
  }, [dispatch]);

  const handleSortChange = useCallback((sortKey: string, sortAscending: boolean) => {
    dispatch(actions.setTransactionListSort(sortKey, sortAscending));
  }, [dispatch]);

  const handleFilterCategories = useCallback((filterCategories: any, numTransactions: number) => {
    dispatch(actions.setTransactionListFilterCategories(
      filterCategories instanceof Set ? Array.from(filterCategories) : filterCategories,
      numTransactions
    ));
  }, [dispatch]);

  const handleRoundAmount = useCallback((enabled: boolean) => {
    dispatch(actions.setTransactionListRoundAmount(enabled));
  }, [dispatch]);

  if (!hasTransactions) return <NoData />;

  return (
    <>
      <div className="flex flex-wrap gap-6 items-center">
        <div className="w-auto">
          <Link href="/transactions/add" className="inline-flex items-center justify-center rounded font-medium transition-colors border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2">
            <FontAwesomeIcon icon="upload" className="mr-1" fixedWidth />
            Add More Transactions
          </Link>
          <button
            className="inline-flex items-center justify-center rounded font-medium transition-colors border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white px-4 py-2 ml-2"
            onClick={handleGuessCategories}
          >
            <FontAwesomeIcon icon="lightbulb" className="mr-1" fixedWidth />
            Guess missing categories
          </button>
        </div>
        <div className="w-auto status">
          {isCategoryGuessing &&
            <span>
              Guessing categories...
              <FontAwesomeIcon icon="spinner" className="ml-1" pulse />
            </span>
          }
        </div>
      </div>
      <hr />
      <TransactionTable
        transactions={transactions}
        transactionGroups={transactionGroups}
        categories={categories}
        accounts={accounts}
        handleRowCategoryChange={handleRowCategoryChange}
        handleDeleteRow={handleDeleteRow}
        handleIgnoreRow={handleIgnoreRow}
        handleGroupRows={handleGroupRows}
        handleSearch={handleSearch}
        handleDatesChange={handleDatesChange}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        handleSortChange={handleSortChange}
        handleFilterCategories={handleFilterCategories}
        handleRoundAmount={handleRoundAmount}
        handleDeleteTransactionGroup={handleDeleteTransactionGroup}
        showCreateCategoryModal={showCreateCategoryModal}
        {...transactionListSettings}
      />
      <NewCategoryForRow 
        show={showNewCategoryModal}
        onHide={() => setShowNewCategoryModal(false)}
        categoryName={newCategoryName}
        parentCategories={parentCategories}
        handleNewRowCategory={handleNewRowCategory}
        rowId={newCategoryTransactionId}
      />
    </>
  );
}
