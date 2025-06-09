import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IgnoreTransactionProps {
  transactionId: string;
  isIgnored: boolean;
  handleIgnoreRow: (transactionId: string, ignored: boolean) => void;
}

export default function IgnoreTransaction({
  transactionId,
  isIgnored,
  handleIgnoreRow
}: IgnoreTransactionProps) {
  if (!isIgnored) {
    return (
      <FontAwesomeIcon
        icon="ban"
        className="cursor-pointer"
        data-tooltip-id="ignore-tooltip"
        data-tooltip-content="Ignore row in charts. This is useful if the transaction is not actually an income or expense, e.g. transfers between accounts"
        onClick={() => handleIgnoreRow(transactionId, true)}
        fixedWidth
      />
    );
  }

  return (
    <FontAwesomeIcon
      icon="plus"
      className="cursor-pointer"
      data-tooltip-id="include-tooltip"
      data-tooltip-content="Include row in charts."
      onClick={() => handleIgnoreRow(transactionId, false)}
      fixedWidth
    />
  );
}
