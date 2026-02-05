import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import moment from 'moment';
import { uncategorized } from '../../data/categories';
import Pagination from '../shared/Pagination';
import CategorySelect from '../shared/CategorySelect';
import Dates from '../Dates';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import SearchField from './SearchField';
import BulkActions from './BulkActions';
import { Transaction } from '../../types/redux';


interface DateSelect {
  id: string;
  startDate?: any; // moment object
  endDate?: any; // moment object
}

interface Props {
  transactions: Transaction[];
  categories: Record<string, any>;
  accounts: Record<string, any>;
  dateSelect: DateSelect;
  page: number;
  pageSize: number;
  sortKey: string;
  sortAscending: boolean;
  filterCategories: Set<string>;
  showCreateCategoryModal: (name: string, transactionId: string) => void;
  handleIgnoreRow: (transactionId: string, ignored: boolean) => void;
  handleDeleteRow: (transactionId: string) => void;
  handleGroupRows: (transactionIds: string[]) => void;
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
  handleSearch: (text: string, page: number) => void;
  handleDatesChange: (startDate: any, endDate: any) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number, totalRows: number) => void;
  handleSortChange: (sortKey: string, ascending: boolean) => void;
  handleFilterCategories: (categories: Set<string>, totalRows: number) => void;
  searchText?: string;
  handleRoundAmount: (round: boolean) => void;
  handleDeleteTransactionGroup: (groupId: string) => void;
  roundAmount?: boolean;
  transactionGroups?: Record<string, any>;
}

const filterData = (data: Transaction[], categories: Set<string>, dateSelect: DateSelect): Transaction[] => {
  let categoryFilter = (t: Transaction) => true;
  let dateFilter = (t: Transaction) => true;

  if (categories && categories.size > 0) {
    categoryFilter = t => {
      return (!t.categoryConfirmed && categories.has(uncategorized.id)) ||
        (!!t.categoryConfirmed && categories.has(t.categoryConfirmed.id));
    };
  }

  if (dateSelect.startDate && dateSelect.endDate) {
    dateFilter = t => {
      return moment(t.date)
        .isBetween(dateSelect.startDate, dateSelect.endDate, 'day', '[]');
    };
  }

  return data.filter(t => categoryFilter(t) && dateFilter(t));
};

const sortData = (data: Transaction[], sortKey: string, sortAscending: boolean): Transaction[] => {
  return [...data] // Create new array to avoid inplace sort of original array.
    .sort((a, b) => {
      const [val1, val2] = [(a as any)[sortKey], (b as any)[sortKey]];
      if (typeof val1 === 'string') {
        return sortAscending ? val1.localeCompare(val2) : val2.localeCompare(val1);
      }
      return sortAscending ? val1 - val2 : val2 - val1;
    });
}

export default function TransactionTable({
  transactions,
  categories,
  accounts,
  dateSelect,
  page,
  pageSize,
  sortKey,
  sortAscending,
  filterCategories,
  showCreateCategoryModal,
  handleIgnoreRow,
  handleDeleteRow,
  handleGroupRows,
  handleRowCategoryChange,
  handleSearch,
  handleDatesChange,
  handlePageChange,
  handlePageSizeChange,
  handleSortChange,
  handleFilterCategories,
  searchText,
  handleRoundAmount,
  handleDeleteTransactionGroup,
  roundAmount = true,
  transactionGroups = {}
}: Props) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [data, setData] = useState<Transaction[]>([]);
  const [dataView, setDataView] = useState<Transaction[]>([]);
  const [isSelectedRowsUpdate, setIsSelectedRowsUpdate] = useState(false);

  // Note: react-tooltip v5 doesn't need manual rebuild

  useEffect(() => {
    // Hack: This is to ensure that when a row is selected, it will not sort and
    // filter the data below. But yeah, it's a hack.
    if (isSelectedRowsUpdate) {
      setIsSelectedRowsUpdate(false);
      return;
    }

    // Only called when receiving new props or on the first render. So
    // this is where we should just set all the raw transactions into local
    // state so we can easier sort, filter, etc. later
    const newData = [...transactions];
    const newDataView = sortData(
      filterData(newData, filterCategories, dateSelect),
      sortKey,
      sortAscending
    );
    setData(newData);
    setDataView(newDataView);
    setSelectedRows(new Set());
  }, [transactions, filterCategories, dateSelect, sortKey, sortAscending, isSelectedRowsUpdate]);

  const handlePageSizeChangeInternal = (newPageSize: number) => {
    handlePageSizeChange(newPageSize, dataView.length);
  };

  const handleCategorySelect = (option: any) => {
    // Convert to Set format that we expect
    const options = Array.isArray(option) ? option : (option ? [option] : []);
    const newFilterCategories = new Set(options.map((o: any) => o.value));

    // Since the category filter might reduce the number of transactions, we
    // need to know the new number of transactions here.
    const newData = filterData(data, newFilterCategories, dateSelect)
    handleFilterCategories(newFilterCategories, newData.length);
  };

  const handleSearchInternal = (text: string) => {
    handleSearch(text, page);
  };

  const handleRowSelect = (transactionId: string | string[], forceInclusion = false) => {
    setSelectedRows(prevState => {
      const newSelectedRows = new Set([...prevState.values()]);
      const ids = Array.isArray(transactionId) ? transactionId : [transactionId];
      
      ids.forEach(tId => {
        // We are de-selecting if the transaction exists in the row list already, unless forceInclusion is true
        if (!forceInclusion && newSelectedRows.has(tId)) {
          newSelectedRows.delete(tId);
        } else {
          newSelectedRows.add(tId);
        }
      });
      
      setIsSelectedRowsUpdate(true);
      return newSelectedRows;
    });
  };

  const handleSelectAll = (rowIds: string[]) => {
    handleRowSelect(rowIds, true);
  };

  const handleSelectNone = () => {
    setSelectedRows(new Set());
    setIsSelectedRowsUpdate(true);
  };

  const dataPage = dataView
    .slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="row align-items-center">
        <div className="col-12 col-md-auto">
          <Dates
            id={dateSelect.id}
            startDate={dateSelect.startDate}
            endDate={dateSelect.endDate}
            handleDatesChange={handleDatesChange}
            showPresets={false}
            dateProps={{
              showClearDates: true,
              small: true
            }}
          />
        </div>
        <div className="col-12 col-md-auto">
          <div className="form-check align-items-center">
            <input
              type="checkbox"
              id="round-amounts"
              className="form-check-input"
              checked={roundAmount}
              onChange={e => handleRoundAmount(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="round-amounts">Round Amounts</label>
          </div>
        </div>
      </div>
      <div className="mt-3 row align-items-center">
        <div className="col-lg-6">
          <div className="row align-items-center">
            <div className="col-auto">
              <SearchField handleSearch={handleSearchInternal} searchText={searchText} />
            </div>
            <div className="col">
              <CategorySelect
                placeholder="Filter by category..."
                onChange={handleCategorySelect}
                selectedCategory={Array.from(filterCategories)}
              />
            </div>
          </div>
        </div>
        <div className="col-lg-6 mt-3 mt-lg-0">
          <Pagination
            page={page}
            pageSize={pageSize}
            rowCount={dataView.length}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChangeInternal}
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <BulkActions
            selectedTransactions={dataPage.filter(t => selectedRows.has(t.id))}
            handleRowCategoryChange={handleRowCategoryChange}
            handleSelectAll={() => handleSelectAll(dataPage.map(t => t.id))}
            handleSelectNone={handleSelectNone}
            showCreateCategoryModal={() => showCreateCategoryModal('', '')}
            handleGroupRows={handleGroupRows}
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <table className="table table-striped table-hover table-responsive-md mt-1">
            <thead className="thead-dark">
              <tr>
                <SortHeader
                  label="Date"
                  sortKey="date"
                  sortAscending={sortAscending}
                  activeSortKey={sortKey}
                  handleSortChange={handleSortChange}
                />
                <SortHeader
                  label="Description"
                  sortKey="description"
                  sortAscending={sortAscending}
                  activeSortKey={sortKey}
                  handleSortChange={handleSortChange}
                />
                <SortHeader
                  className="text-right"
                  label="Amount"
                  sortKey="amount"
                  sortAscending={sortAscending}
                  activeSortKey={sortKey}
                  handleSortChange={handleSortChange}
                />
                <SortHeader
                  className="text-right"
                  label="Total"
                  sortKey="total"
                  sortAscending={sortAscending}
                  activeSortKey={sortKey}
                  handleSortChange={handleSortChange}
                />
                <th>Category</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dataPage.map(transaction => {
                return <TransactionRow
                  key={`row-${transaction.id}`}
                  transaction={transaction}
                  accounts={accounts}
                  handleRowCategoryChange={handleRowCategoryChange}
                  handleDeleteRow={handleDeleteRow}
                  handleIgnoreRow={handleIgnoreRow}
                  handleRowSelect={handleRowSelect}
                  showCreateCategoryModal={showCreateCategoryModal}
                  roundAmount={roundAmount}
                  isSelected={selectedRows.has(transaction.id)}
                  transactionGroup={transactionGroups[transaction.id]}
                  handleDeleteTransactionGroup={handleDeleteTransactionGroup}
                />
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Tooltip id="transaction-tooltip" />
      <Tooltip id="ignore-tooltip" />
      <Tooltip id="include-tooltip" />
      <Tooltip id="delete-tooltip" />
    </>
  );
}
