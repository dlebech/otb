import React from 'react';
import { Transaction } from '../../types/redux';
import BulkActionSelection from './BulkActionSelection';

interface SelectionIntroProps {
  selectedTransactions: Transaction[];
  handleSelectAll: () => void;
  handleSelectNone: () => void;
}

function SelectionIntro({
  selectedTransactions,
  handleSelectAll,
  handleSelectNone
}: SelectionIntroProps) {
  return (
    <div className="inline-flex">
      <small>Bulk actions:</small>
      <small className="text-gray-500 cursor-pointer ml-2" onClick={handleSelectAll}><u>Select all rows</u></small>
      {selectedTransactions.length === 0 && 
        <small className="text-gray-500 ml-2">(or click on a row&#39;s date or description to select it)</small>}
      {selectedTransactions.length >= 1 &&
        <>
          <small className="text-gray-500 cursor-pointer ml-2" onClick={handleSelectNone}><u>Clear selection</u></small>
          <small className="text-gray-500 ml-2" >
            ({selectedTransactions.length} transaction{selectedTransactions.length > 1 ? 's': ''} selected)
          </small>
        </>}
    </div>
  );
}

interface BulkActionsProps {
  selectedTransactions: Transaction[];
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
  handleSelectAll: () => void;
  handleSelectNone: () => void;
  showCreateCategoryModal: () => void;
  handleGroupRows: (transactionIds: string[]) => void;
}

export default function BulkActions({
  selectedTransactions,
  handleRowCategoryChange,
  handleSelectAll,
  handleSelectNone,
  showCreateCategoryModal,
  handleGroupRows
}: BulkActionsProps) {
  return (
    <>
      <SelectionIntro
        selectedTransactions={selectedTransactions}
        handleSelectAll={handleSelectAll}
        handleSelectNone={handleSelectNone}
      />
      <BulkActionSelection
        selectedTransactions={selectedTransactions}
        handleRowCategoryChange={handleRowCategoryChange}
        showCreateCategoryModal={showCreateCategoryModal}
        handleGroupRows={handleGroupRows}
      />
    </>
  );
}
