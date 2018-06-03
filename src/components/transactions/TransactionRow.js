import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import Confirm from '../modals/Confirm';
import RowCategorizer from './RowCategorizer';
import IgnoreTransaction from './IgnoreTransaction';
import ConfirmDelete from './ConfirmDelete';

const TransactionRow = props => {
  const handleDelete = async () => {
    await props.hideModal(Confirm.modalName);
    props.handleDeleteRow(props.transaction.id);
  };

  const handleDeleteConfirm = () => {
    props.showModal(Confirm.modalName, {
      handleYes: handleDelete,
      yesLabel: "Yes, delete it",
      yesButtonClass: "btn-danger",
      body: <ConfirmDelete
        transactionDate={props.transaction.date}
        transactionDescription={props.transaction.description}
      />
    });
  }

  let className = '';
  if (props.transaction.ignore) className = 'table-warning';

  return (
    <tr className={className}>
      <td className="text-nowrap">
        {props.transaction.date.format('L')}
      </td>
      <td>
        {props.transaction.description}
      </td>
      <td>
        {props.transaction.amount}
      </td>
      <td>
        {props.transaction.total}
      </td>
      <td className="text-nowrap">
        <RowCategorizer
          transaction={props.transaction}
          categoryOptions={props.categoryOptions}
          handleRowCategory={props.handleRowCategory}
        />
      </td>
      <td className="text-nowrap">
        <div className="d-inline-flex">
          <IgnoreTransaction
            transactionId={props.transaction.id}
            handleIgnoreRow={props.handleIgnoreRow}
            isIgnored={!!props.transaction.ignore}
          />
          <FontAwesomeIcon
            icon="trash-alt"
            className="cursor-pointer text-danger"
            data-tip="Delete row"
            onClick={handleDeleteConfirm}
            fixedWidth
          />
        </div>
      </td>
    </tr>
  );
};

TransactionRow.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(moment),
    ignore: PropTypes.bool,
    categoryGuess: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }),
    categoryConfirmed: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  }).isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleDeleteRow: PropTypes.func.isRequired,
  handleIgnoreRow: PropTypes.func.isRequired,
  handleRowCategory: PropTypes.func.isRequired
};

export default TransactionRow;
