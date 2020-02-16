import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import { uncategorized } from '../../data/categories';
import Pagination from '../shared/Pagination';
import CategorySelect from '../shared/CategorySelect';
import Dates from '../Dates';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import SearchField from './SearchField';
import BulkActions from './BulkActions';

const filterData = (data, categories, dateSelect) => {
  let categoryFilter = t => true;
  let dateFilter = t => true;
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

const sortData = (data, sortKey, sortAscending) => {
  return [...data] // Create new array to avoid inplace sort of original array.
    .sort((a, b) => {
      const [val1, val2] = [a[sortKey], b[sortKey]];
      if (typeof val1 === 'string') {
        return sortAscending ? val1.localeCompare(val2) : val2.localeCompare(val1);
      }
      return sortAscending ? val1 - val2 : val2 - val1;
    });
}

class TransactionTable extends React.Component {
  constructor(props) {
    super(props);

    // The data from props is actually being stored in state as well, but they
    // are set further down.
    this.state = { selectedRows: new Set(), isSelectedRowsUpdate: false };

    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleDatesChange = this.handleDatesChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleRowSelect = this.handleRowSelect.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleSelectNone = this.handleSelectNone.bind(this);
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  static getDerivedStateFromProps(props, state) {
    // Hack: This is to ensure that when a row is selected, it will not sort and
    // filter the data below. But yeah, it's a hack. See the note below.
    if (state.isSelectedRowsUpdate) return { isSelectedRowsUpdate: false };

    // Only called when receiving new props/state or on the first render. So
    // this is where we should just set all the raw transactions into local
    // state so we can easier sort, filter, etc. later
    // XXX: This is most likely an anti-pattern. And it could probably be moved
    // to the reducers instead.
    // https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
    const data = [...props.transactions];
    const dataView = sortData(
      filterData(data, props.filterCategories, props.dateSelect),
      props.sortKey,
      props.sortAscending
    );
    return { data, dataView, selectedRows: new Set() };
  }

  handleDatesChange({ startDate, endDate }) {
    this.props.handleDatesChange(this.props.dateSelect.id, startDate, endDate);
  }

  handlePageSizeChange(pageSize) {
    this.props.handlePageSizeChange(pageSize, this.state.dataView.length);
  }

  handleCategorySelect(options) {
    // Options is sometimes null
    options = options || [];
    const filterCategories = new Set(options.map(o => o.value));

    // Since the category filter might reduce the number of transactions, we
    // need to know the new number of transactions here.
    const newData = filterData(this.state.data, filterCategories, this.props.dateSelect)
    this.props.handleFilterCategories(filterCategories, newData.length);
  }

  handleSearch(text) {
    this.props.handleSearch(text, this.props.page);
  }

  handleRowSelect(transactionId, forceInclusion=false) {
    this.setState(prevState => {
      const selectedRows = new Set([...prevState.selectedRows.values()]);
      if (!Array.isArray(transactionId)) transactionId = [transactionId];
      transactionId.forEach(tId => {
        // We are de-selecting if the transaction exists in the row list already, unless forceInclusion is true
        if (!forceInclusion && selectedRows.has(tId)) selectedRows.delete(tId);
        else (selectedRows.add(tId));
      });
      return { selectedRows, isSelectedRowsUpdate: true };
    })
  }

  handleSelectAll(rowIds) {
    this.handleRowSelect(rowIds, true);
  }

  handleSelectNone() {
    this.setState({ selectedRows: new Set(), isSelectedRowsUpdate: true });
  }

  render() {
    const dataPage = this.state.dataView
      .slice((this.props.page-1) * this.props.pageSize, this.props.page * this.props.pageSize);

    return (
      <>
        <div className="row align-items-center">
          <div className="col-12 col-md-auto">
            <Dates
              id={this.props.dateSelect.id}
              startDate={this.props.dateSelect.startDate}
              endDate={this.props.dateSelect.endDate}
              handleDatesChange={this.handleDatesChange}
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
                checked={this.props.roundAmount}
                onChange={e => this.props.handleRoundAmount(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="round-amounts">Round Amounts</label>
            </div>
          </div>
        </div>
        <div className="mt-3 row align-items-center">
          <div className="col-lg-6">
            <div className="row align-items-center">
              <div className="col-auto">
                <SearchField handleSearch={this.handleSearch} searchText={this.props.searchText} />
              </div>
              <div className="col">
                <CategorySelect
                  placeholder="Filter by category..."
                  onChange={this.handleCategorySelect}
                  selectedCategory={Array.from(this.props.filterCategories)}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 mt-3 mt-lg-0">
            <Pagination
              page={this.props.page}
              pageSize={this.props.pageSize}
              rowCount={this.state.dataView.length}
              handlePageChange={this.props.handlePageChange}
              handlePageSizeChange={this.handlePageSizeChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <BulkActions
              selectedTransactions={dataPage.filter(t => this.state.selectedRows.has(t.id))}
              handleRowCategoryChange={this.props.handleRowCategoryChange}
              handleSelectAll={() => this.handleSelectAll(dataPage.map(t => t.id))}
              handleSelectNone={this.handleSelectNone}
              showCreateCategoryModal={this.props.showCreateCategoryModal}
              handleGroupRows={this.props.handleGroupRows}
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
                    sortAscending={this.props.sortAscending}
                    activeSortKey={this.props.sortKey}
                    handleSortChange={this.props.handleSortChange}
                  />
                  <SortHeader
                    label="Description"
                    sortKey="description"
                    sortAscending={this.props.sortAscending}
                    activeSortKey={this.props.sortKey}
                    handleSortChange={this.props.handleSortChange}
                  />
                  <SortHeader
                    className="text-right"
                    label="Amount"
                    sortKey="amount"
                    sortAscending={this.props.sortAscending}
                    activeSortKey={this.props.sortKey}
                    handleSortChange={this.props.handleSortChange}
                  />
                  <SortHeader
                    className="text-right"
                    label="Total"
                    sortKey="total"
                    sortAscending={this.props.sortAscending}
                    activeSortKey={this.props.sortKey}
                    handleSortChange={this.props.handleSortChange}
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
                    accounts={this.props.accounts}
                    handleRowCategoryChange={this.props.handleRowCategoryChange}
                    handleDeleteRow={this.props.handleDeleteRow}
                    handleIgnoreRow={this.props.handleIgnoreRow}
                    handleRowSelect={this.handleRowSelect}
                    showCreateCategoryModal={this.props.showCreateCategoryModal}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    roundAmount={this.props.roundAmount}
                    isSelected={this.state.selectedRows.has(transaction.id)}
                    transactionGroup={this.props.transactionGroups[transaction.id]}
                    handleDeleteTransactionGroup={this.props.handleDeleteTransactionGroup}
                  />
                })}
              </tbody>
            </table>
          </div>
        </div>
        <ReactTooltip />
      </>
    );
  }
}

TransactionTable.propTypes = {
  // Required fields
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    categoryGuess: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }),
    categoryConfirmed: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  })).isRequired,
  categories: PropTypes.object.isRequired,
  accounts: PropTypes.object.isRequired,
  dateSelect: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  sortKey: PropTypes.string.isRequired,
  sortAscending: PropTypes.bool.isRequired,
  filterCategories: PropTypes.instanceOf(Set).isRequired,
  showCreateCategoryModal: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleGroupRows: PropTypes.func.isRequired,
  handleRowCategoryChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleDatesChange: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handlePageSizeChange: PropTypes.func.isRequired,
  handleSortChange: PropTypes.func.isRequired,
  handleFilterCategories: PropTypes.func.isRequired,
  searchText: PropTypes.string,
  handleRoundAmount: PropTypes.func.isRequired,
  handleDeleteTransactionGroup: PropTypes.func.isRequired,
  roundAmount: PropTypes.bool,
  transactionGroups: PropTypes.object
};

TransactionTable.defaultProps = {
  roundAmount: true
};

export default TransactionTable;
