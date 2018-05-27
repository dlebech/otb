import React from 'react';
import PropTypes from 'prop-types';
import TransactionRow from './TransactionRow';

const TransactionTable = props => {
  const data = props.transactions;

  return (
    <div className="row">
      <div className="col">
        <table className="table table-striped mt-3">
          <thead className="thead-dark">
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Total</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((transaction, i) => {
              return <TransactionRow
                key={`row-${transaction.id}`}
                transaction={transaction}
                categories={props.categories}
                handleRowCategory={props.handleRowCategory}
                handleEditCategoryForRow={props.handleEditCategoryForRow}
                handleDeleteRow={props.handleDeleteRow}
                handleIgnoreRow={props.handleIgnoreRow}
                showModal={props.showModal}
                hideModal={props.hideModal}
              />
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  })).isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleEditCategoryForRow: PropTypes.func.isRequired,
  handleRowCategory: PropTypes.func.isRequired,
};

export default TransactionTable;
