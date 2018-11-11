import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Select from 'react-select';
import moment from 'moment';
import { uncategorized } from '../../data/categories';
import Pagination from '../shared/Pagination';
import Dates from '../Dates';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import SearchField from './SearchField';

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
  return [].concat(data) // Concat to avoid inplace sort of original array.
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
    this.state = {};

    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleDatesChange = this.handleDatesChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  static getDerivedStateFromProps(props) {
    // Only called when receiving new props or on the first render. So this is
    // where we should just set all the raw transactions into local state so we
    // can easier sort, filter, etc. later
    const data = [].concat(props.transactions);
    const dataView = sortData(
      filterData(data, props.filterCategories, props.dateSelect),
      props.sortKey,
      props.sortAscending
    );
    return { data, dataView };
  }

  handleDatesChange({ startDate, endDate }) {
    this.props.handleDatesChange(this.props.dateSelect.id, startDate, endDate);
  }

  handlePageSizeChange(pageSize) {
    this.props.handlePageSizeChange(pageSize, this.state.dataView.length);
  }

  handleCategorySelect(options, action) {
    if (action.action !== 'select-option' &&
      action.action !== 'remove-value' &&
      action.action !== 'clear') {
      return;
    }

    const filterCategories = new Set(options.map(o => o.value));

    // Since he category filter might reduce the number of transactions, we need
    // to know the new number of transactions here.
    const newData = filterData(this.state.data, filterCategories, this.props.dateSelect)
    this.props.handleFilterCategories(filterCategories, newData.length);
  }

  handleSearch(text) {
    this.props.handleSearch(text, this.props.page);
  }

  render() {
    const dataPage = this.state.dataView
      .slice((this.props.page-1) * this.props.pageSize, this.props.page * this.props.pageSize);

    // Map category options here to avoid having children re-map these for every
    // row.
    const categoryOptions = Object.values(this.props.categories)
      .map(category => ({
        label: category.parent ?
          `${this.props.categories[category.parent].name} - ${category.name}` :
          category.name,
        value: category.id
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const categoryOptionsWithUncategorized = [
      {
        label: uncategorized.name,
        value: uncategorized.id
      }
    ].concat(categoryOptions);

    const selectedCategories = (this.props.filterCategories && this.props.filterCategories.size > 0) ?
      categoryOptionsWithUncategorized
        .filter(o => this.props.filterCategories.has(o.value))
        : null;

    return (
      <React.Fragment>
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
                <Select
                  options={categoryOptionsWithUncategorized}
                  name="category-filter"
                  className="category-select"
                  placeholder="Filter by category..."
                  onChange={this.handleCategorySelect}
                  value={selectedCategories}
                  isMulti
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
            <table className="table table-striped table-responsive-md mt-3">
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
                {dataPage.map((transaction, i) => {
                  return <TransactionRow
                    key={`row-${transaction.id}`}
                    transaction={transaction}
                    categoryOptions={categoryOptions}
                    accounts={this.props.accounts}
                    handleRowCategory={this.props.handleRowCategory}
                    handleDeleteRow={this.props.handleDeleteRow}
                    handleIgnoreRow={this.props.handleIgnoreRow}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
                    roundAmount={this.props.roundAmount}
                  />
                })}
              </tbody>
            </table>
          </div>
        </div>
        <ReactTooltip />
      </React.Fragment>
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
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleRowCategory: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleDatesChange: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handlePageSizeChange: PropTypes.func.isRequired,
  handleSortChange: PropTypes.func.isRequired,
  handleFilterCategories: PropTypes.func.isRequired,
  searchText: PropTypes.string,
  handleRoundAmount: PropTypes.func.isRequired,
  roundAmount: PropTypes.bool,
};

TransactionTable.defaultProps = {
  roundAmount: true
};

export default TransactionTable;
