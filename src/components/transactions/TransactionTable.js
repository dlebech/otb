import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import Pagination from '../shared/Pagination';

const filterData = (data, showOnlyUncategorized = false) => {
  return data.filter(t => showOnlyUncategorized ? !t.categoryConfirmed : true);
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
      showOnlyUncategorized: false,
      searchText: props.searchText
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleShowOnlyUncategorized = this.handleShowOnlyUncategorized.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
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
      filterData(data, state.showOnlyUncategorized),
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

  handleShowOnlyUncategorized(e) {
    const showOnlyUncategorized = e.target.checked;

    // Need to both re-filter and re-sort
    const dataView = sortData(
      filterData(this.state.data, showOnlyUncategorized),
      this.state.sortKey,
      this.state.sortAscending
    );

    // Check if the new filter changes the last page.
    let page = this.state.page;
    const lastPage = Math.ceil(dataView.length / this.state.pageSize);
    if (lastPage < page) page = lastPage;

    this.setState({ page, showOnlyUncategorized, dataView });
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

    return (
      <React.Fragment>
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="row align-items-center">
              <div className="col-auto">
                <input
                  type="text"
                  placeHolder="Search for a transaction"
                  className="form-control form-col-auto"
                  value={this.state.searchText}
                  onChange={this.handleSearch}
                />
              </div>
              <div className="col-auto">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="check-uncategorized"
                    className="form-check-input"
                    checked={this.state.showOnlyUncategorized}
                    onChange={this.handleShowOnlyUncategorized}
                  />
                  <label htmlFor="check-uncategorized" className="form-check-label">
                    Show only uncategorized
                  </label>
                </div>
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
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleRowCategory: PropTypes.func.isRequired
};

export default TransactionTable;
