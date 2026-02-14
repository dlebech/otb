import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type DisplayTransactionGroup } from '../../types/app';

interface GroupedTransactionProps {
  transactionId: string;
  transactionGroup?: DisplayTransactionGroup;
  handleDeleteTransactionGroup: (groupId: string) => void;
}

export default function GroupedTransaction({
  transactionId,
  transactionGroup,
  handleDeleteTransactionGroup
}: GroupedTransactionProps) {
  if (!transactionGroup) return null;

  const deleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteTransactionGroup(transactionGroup.groupId);
    return false;
  };

  const id = `link-tip-${transactionId}`;
  
  return (
    <>
      <FontAwesomeIcon
        icon="link"
        className="cursor-pointer text-blue-500"
        data-tooltip-id={id}
        fixedWidth
        onClick={deleteGroup}
      />
      <Tooltip id={id}>
        <div>This transaction is grouped with:</div>
        {transactionGroup.linkedTransactions.map(t => {
          return (
            <div key={`${id}-${t.id}`}>
              {t.date.format('L')}: {t.description.substr(0, 30)}{t.description.length > 30 ? '...': ''}
            </div>
          );
        })}
        <div className="mt-2">Click to ungroup</div>
      </Tooltip>
    </>
  );
}
