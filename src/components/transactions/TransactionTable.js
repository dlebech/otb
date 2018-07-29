import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import Select from 'react-select';
import moment from 'moment';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import Pagination from '../shared/Pagination';
import { uncategorized } from '../../data/categories';
import Dates from '../Dates';

const filterData = (data, categories, dateSelect) => {
  let categoryFilter = t => true;
  let dateFilter = t => true;
  if (Array.isArray(categories) && categories.length > 0) {
    categories = new Set(categories);
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
    this.state = {
      page: 1,
      pageSize: 50,
      sortKey: 'date',
      sortAscending: true,
      filterCategories: [],
      searchText: props.searchText
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleDatesChange = this.handleDatesChange.bind(this);
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  static getDerivedStateFromProps(props, state) {
    // Only called when receiving new props or on the first render. So this is
    // where we should just set all the raw transactions into local state so we
    // can easier sort, filter, etc. later
    const data = [].concat(props.transactions);
    const dataView = sortData(
      filterData(data, state.filterCategories, props.dateSelect),
      state.sortKey,
      state.sortAscending
    );
    return { data, dataView };
  }

  handlePageChange(page) {
    this.setState({ page });
  }

  handleSearch(e) {
    this.setState({ searchText: e.target.value }, () => {
      this.props.handleSearch(this.state.searchText);
    });
  }

  handleDatesChange({ startDate, endDate }) {
    this.props.handleDatesChange(this.props.dateSelect.id, startDate, endDate);
  }

  handlePageSizeChange(pageSize) {
    // Check that the new page does not exceed the existing page.
    let page = this.state.page;
    const lastPage = Math.ceil(this.state.dataView.length / pageSize);
    if (lastPage < page) page = lastPage;
    this.setState({ page, pageSize });
  }

  handleSortChange(sortKey, sortAscending) {
    const dataView = sortData(this.state.dataView, sortKey, sortAscending);
    this.setState({ sortKey, sortAscending, dataView });
  }

  handleCategorySelect(options, action) {
    if (action.action !== 'select-option' &&
      action.action !== 'remove-value' &&
      action.action !== 'clear') {
      return;
    }

    const filterCategories = options.map(o => o.value);

    // Need to both re-filter and re-sort
    const dataView = sortData(
      filterData(this.state.data, filterCategories, this.props.dateSelect),
      this.state.sortKey,
      this.state.sortAscending
    );

    // Check if the new filter changes the last page.
    let page = this.state.page;
    const lastPage = Math.ceil(dataView.length / this.state.pageSize);
    if (lastPage < page) page = lastPage;
    if (page === 0) page = 1;

    this.setState({ page, filterCategories, dataView });
  }

  render() {
    const dataPage = this.state.dataView
      .slice((this.state.page-1) * this.state.pageSize, this.state.page * this.state.pageSize);

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

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-12">
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
        </div>
        <div className="mt-3 row align-items-center">
          <div className="col-lg-6">
            <div className="row align-items-center">
              <div className="col-auto">
                <input
                  type="text"
                  placeholder="Search for a transaction"
                  className="form-control form-col-auto"
                  value={this.state.searchText}
                  onChange={this.handleSearch}
                />
              </div>
              <div className="col">
                <Select
                  options={categoryOptionsWithUncategorized}
                  name="category-filter"
                  className="category-select"
                  placeholder="Filter by category..."
                  onChange={this.handleCategorySelect}
                  isMulti
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6 mt-3 mt-lg-0">
            <Pagination
              page={this.state.page}
              pageSize={this.state.pageSize}
              rowCount={this.state.dataView.length}
              handlePageChange={this.handlePageChange}
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
                    sortAscending={this.state.sortAscending}
                    activeSortKey={this.state.sortKey}
                    handleSortChange={this.handleSortChange}
                  />
                  <SortHeader
                    label="Description"
                    sortKey="description"
                    sortAscending={this.state.sortAscending}
                    activeSortKey={this.state.sortKey}
                    handleSortChange={this.handleSortChange}
                  />
                  <SortHeader
                    label="Amount"
                    sortKey="amount"
                    sortAscending={this.state.sortAscending}
                    activeSortKey={this.state.sortKey}
                    handleSortChange={this.handleSortChange}
                  />
                  <SortHeader
                    label="Total"
                    sortKey="total"
                    sortAscending={this.state.sortAscending}
                    activeSortKey={this.state.sortKey}
                    handleSortChange={this.handleSortChange}
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
                    handleRowCategory={this.props.handleRowCategory}
                    handleDeleteRow={this.props.handleDeleteRow}
                    handleIgnoreRow={this.props.handleIgnoreRow}
                    showModal={this.props.showModal}
                    hideModal={this.props.hideModal}
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
  dateSelect: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleRowCategory: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  handleDatesChange: PropTypes.func.isRequired
};

export default TransactionTable;
