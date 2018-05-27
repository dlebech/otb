import React from 'react';
import PropTypes from 'prop-types';
import TransactionRow from './TransactionRow';

const TransactionTable = props => {
  const data = props.transactions;

  // Map category options here to avoid having children re-map these for every
  // row.
  const categoryOptions = Object.values(props.categories)
    .map(category => ({
      label: category.parent ?
        `${props.categories[category.parent].name} - ${category.name}` :
        category.name,
      value: category.id
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

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
                categoryOptions={categoryOptions}
                handleRowCategory={props.handleRowCategory}
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
