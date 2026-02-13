import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'react-tooltip';
import { Transaction, Account } from '../../types/redux';
import ConfirmModal from '../shared/ConfirmModal';
import RowCategorizer from './RowCategorizer';
import IgnoreTransaction from './IgnoreTransaction';
import GroupedTransaction from './GroupedTransaction';
import ConfirmDelete from './ConfirmDelete';
import { formatNumber } from '../../util';

interface TransactionGroup {
  groupId: string;
  linkedTransactions: Array<{
    id: string;
    date: Moment;
    description: string;
  }>;
}

interface AmountProps {
  amount: number | string;
  hasMultipleAccounts: boolean;
  roundAmount: boolean;
  amountId: string;
  account: Account;
}

function Amount({
  amount,
  hasMultipleAccounts,
  roundAmount,
  amountId,
  account
}: AmountProps) {
  const fractions = roundAmount ? 0 : 2;
  const formattedAmount = formatNumber(amount, {
    minimumFractionDigits: fractions,
    maximumFractionDigits: fractions
  });
  const fullAmount = formatNumber(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const tooltipContent = (
    <>
      {roundAmount && <span>
        Full amount: {fullAmount}<br />
      </span>}
      {hasMultipleAccounts && <>
        Currency: {account.currency}<br />
        Account: {account.name}
      </>}
    </>
  );

  return (
    <>
      <span
        className="cursor-help"
        data-tooltip-id={`amount-tip-${amountId}`}
        data-tooltip-content=""
      >
        {formattedAmount}
      </span>
      <Tooltip
        id={`amount-tip-${amountId}`}
        className="text-left"
      >
        {tooltipContent}
      </Tooltip>
    </>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  accounts: { [accountId: string]: Account };
  showCreateCategoryModal: (name: string, transactionId: string) => void;
  handleDeleteRow: (transactionId: string) => void;
  handleIgnoreRow: (transactionId: string, ignored: boolean) => void;
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
  handleRowSelect: (transactionId: string) => void;
  roundAmount: boolean;
  handleDeleteTransactionGroup: (groupId: string) => void;
  transactionGroup?: TransactionGroup;
  isSelected?: boolean;
}

export default function TransactionRow({
  transaction,
  accounts,
  showCreateCategoryModal,
  handleDeleteRow,
  handleIgnoreRow,
  handleRowCategoryChange,
  handleRowSelect,
  roundAmount,
  handleDeleteTransactionGroup,
  transactionGroup,
  isSelected = false
}: TransactionRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    handleDeleteRow(transaction.id);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(true);
  };

  const handleRowSelectClick = () => handleRowSelect(transaction.id);

  let className = '';
  if (isSelected) className = 'table-primary';
  else if (transaction.ignore) className = 'table-warning';

  const account = accounts[transaction.account || ''] || { name: 'N/A', currency: '' };
  const hasMultipleAccounts = Object.keys(accounts).length >= 2;

  return (
    <>
      <tr className={className}>
      <td className="whitespace-nowrap" onClick={handleRowSelectClick}>
        {moment(transaction.date).format('L')}
      </td>
      <td onClick={handleRowSelectClick}>
        {transaction.description}
        <GroupedTransaction
          transactionId={transaction.id}
          transactionGroup={transactionGroup}
          handleDeleteTransactionGroup={handleDeleteTransactionGroup}
        />
      </td>
      <td className="text-right">
        <Amount
          amountId={`amount-${transaction.id}`}
          amount={transaction.amount}
          account={account}
          hasMultipleAccounts={hasMultipleAccounts}
          roundAmount={roundAmount}
        />
      </td>
      <td className="text-right">
        <Amount
          amountId={`total-${transaction.id}`}
          amount={transaction.total}
          account={account}
          hasMultipleAccounts={hasMultipleAccounts}
          roundAmount={roundAmount}
        />
      </td>
      <td className="whitespace-nowrap">
        <RowCategorizer
          transaction={transaction}
          handleRowCategoryChange={handleRowCategoryChange}
          showCreateCategoryModal={showCreateCategoryModal}
        />
      </td>
      <td className="whitespace-nowrap">
        <div className="inline-flex">
          <IgnoreTransaction
            transactionId={transaction.id}
            handleIgnoreRow={handleIgnoreRow}
            isIgnored={!!transaction.ignore}
          />
          <FontAwesomeIcon
            icon="trash-alt"
            className="cursor-pointer text-red-600"
            data-tooltip-id="delete-tooltip"
            data-tooltip-content="Delete row"
            onClick={handleDeleteConfirm}
            fixedWidth
          />
        </div>
      </td>
      </tr>
      
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        confirmText="Yes, delete it"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        body={
          <ConfirmDelete
            transactionDate={moment(transaction.date).format('L')}
            transactionDescription={transaction.description}
          />
        }
      />
    </>
  );
}
