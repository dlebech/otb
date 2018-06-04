import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import TransactionRow from './TransactionRow';
import SortHeader from './SortHeader';
import Pagination from '../shared/Pagination';

class TransactionTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: 50,
      sortKey: 'date',
      sortAscending: true,
      showOnlyUncategorized: false
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleShowOnlyUncategorized = this.handleShowOnlyUncategorized.bind(this);
  }

  handlePageChange(page) {
    this.setState({ page }, () => {
      ReactTooltip.rebuild();
    });
  }

  handlePageSizeChange(pageSize) {
    // Check that the new page does not exceed the existing page.
    let page = this.state.page;
    const lastPage = Math.ceil(this.props.transactions.length / pageSize);
    if (lastPage < page) page = lastPage;
    this.setState({ page, pageSize }, () => {
      ReactTooltip.rebuild();
    });
  }

  handleSortChange(sortKey, sortAscending) {
    this.setState({ sortKey, sortAscending }, () => {
      ReactTooltip.rebuild();
    });
  }

  handleShowOnlyUncategorized(e) {
    this.setState({ showOnlyUncategorized: e.target.checked }, () => {
      ReactTooltip.rebuild();
    });
  }

  render() {
    const data = [].concat(this.props.transactions)
      // XXX This should probably be moved to a global state sorting for performance.
      .filter(t => {
        if (this.state.showOnlyUncategorized) {
          return !t.categoryConfirmed;
        }
        return true;
      })
      .sort((a, b) => {
        const [val1, val2] = [a[this.state.sortKey], b[this.state.sortKey]];
        if (typeof val1 === 'string') {
          return this.state.sortAscending ? val1.localeCompare(val2) : val2.localeCompare(val1);
        }
        return this.state.sortAscending ? val1 - val2 : val2 - val1;
      })
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
          <div className="col-auto">
            <Pagination
              page={this.state.page}
              pageSize={this.state.pageSize}
              rowCount={this.props.transactions.length}
              handlePageChange={this.handlePageChange}
              handlePageSizeChange={this.handlePageSizeChange}
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
                {data.map((transaction, i) => {
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
  handleRowCategory: PropTypes.func.isRequired,
};

export default TransactionTable;
