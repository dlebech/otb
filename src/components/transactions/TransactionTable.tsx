import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import moment, { Moment } from 'moment';
import { uncategorized } from '../../data/categories';
import Pagination from '../shared/Pagination';
import CategorySelect from '../shared/CategorySelect';
import Dates from '../Dates';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import SearchField from './SearchField';
import BulkActions from './BulkActions';
import { Transaction } from '../../types/redux';
import type { Category, Account } from '../../types/redux';


interface DateSelect {
  id: string;
  startDate?: Moment | null;
  endDate?: Moment | null;
}

interface Props {
  transactions: Transaction[];
  categories: Record<string, Category>;
  accounts: Record<string, Account>;
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
  handleDatesChange: (id: string, startDate: Moment | null, endDate: Moment | null) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number, totalRows: number) => void;
  handleSortChange: (sortKey: string, ascending: boolean) => void;
  handleFilterCategories: (categories: Set<string>, totalRows: number) => void;
  searchText?: string;
  handleRoundAmount: (round: boolean) => void;
  handleDeleteTransactionGroup: (groupId: string) => void;
  roundAmount?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionGroups?: Record<string, any>;
}

const filterData = (data: Transaction[], categories: Set<string>, dateSelect: DateSelect): Transaction[] => {
  let categoryFilter: (t: Transaction) => boolean = () => true;
  let dateFilter: (t: Transaction) => boolean = () => true;

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
      const val1 = (a as unknown as Record<string, unknown>)[sortKey];
      const val2 = (b as unknown as Record<string, unknown>)[sortKey];
      if (typeof val1 === 'string' && typeof val2 === 'string') {
        return sortAscending ? val1.localeCompare(val2) : val2.localeCompare(val1);
      }
      return sortAscending ? (val1 as number) - (val2 as number) : (val2 as number) - (val1 as number);
    });
}

export default function TransactionTable({
  transactions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Note: react-tooltip v5 doesn't need manual rebuild

  useEffect(() => {
    // Only called when receiving new props or on the first render. So
    // this is where we should just set all the raw transactions into local
    // state so we can easier sort, filter, etc. later
    const newData = [...transactions];
    const newDataView = sortData(
      filterData(newData, filterCategories, dateSelect),
      sortKey,
      sortAscending
    );
    setData(newData); // eslint-disable-line react-hooks/set-state-in-effect
    setDataView(newDataView);
    setSelectedRows(new Set());
  }, [transactions, filterCategories, dateSelect, sortKey, sortAscending]);

  const handlePageSizeChangeInternal = (newPageSize: number) => {
    handlePageSizeChange(newPageSize, dataView.length);
  };

  const handleCategorySelect = (option: { value: string; label: string } | { value: string; label: string }[] | null) => {
    // Convert to Set format that we expect
    const options = Array.isArray(option) ? option : (option ? [option] : []);
    const newFilterCategories = new Set(options.map((o: { value: string }) => o.value));

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
      
      return newSelectedRows;
    });
  };

  const handleSelectAll = (rowIds: string[]) => {
    handleRowSelect(rowIds, true);
  };

  const handleSelectNone = () => {
    setSelectedRows(new Set());
  };

  const dataPage = dataView
    .slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="flex flex-wrap gap-6 items-center">
        <div className="w-full md:w-auto">
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
        <div className="w-full md:w-auto">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="round-amounts"
              className="mr-2"
              checked={roundAmount}
              onChange={e => handleRoundAmount(e.target.checked)}
            />
            <label className="text-sm" htmlFor="round-amounts">Round Amounts</label>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-6 items-center">
        <div className="w-full lg:flex-1">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="w-auto">
              <SearchField handleSearch={handleSearchInternal} searchText={searchText} />
            </div>
            <div className="flex-1">
              <CategorySelect
                placeholder="Filter by category..."
                onChange={handleCategorySelect}
                selectedCategory={Array.from(filterCategories)}
              />
            </div>
          </div>
        </div>
        <div className="w-full lg:flex-1 mt-4 lg:mt-0">
          <Pagination
            page={page}
            pageSize={pageSize}
            rowCount={dataView.length}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChangeInternal}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
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
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <div className="overflow-x-auto">
          <table className="w-full border-collapse [&_tbody_tr:nth-child(even)]:bg-gray-50 [&_tbody_tr:hover]:bg-gray-100 mt-1">
            <thead className="bg-gray-800 text-white">
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
      </div>
      <Tooltip id="transaction-tooltip" />
      <Tooltip id="ignore-tooltip" />
      <Tooltip id="include-tooltip" />
      <Tooltip id="delete-tooltip" />
    </>
  );
}
