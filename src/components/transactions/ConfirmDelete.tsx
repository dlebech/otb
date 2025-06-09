import React from 'react';

interface ConfirmDeleteProps {
  transactionDate: string;
  transactionDescription: string;
}

export default function ConfirmDelete({
  transactionDate,
  transactionDescription
}: ConfirmDeleteProps) {
  return (
    <React.Fragment>
      <div className="alert alert-danger">
        This will <em>completely</em> remove the transaction. This is
        usually only necessary if the transaction is a duplicate or was
        added by mistake.
      </div>
      <div className="alert alert-info">
        If you do not want the transaction to show up in charts and graphs,
        it is recommended to use the ignore function instead of deleting.
        This preserves the correct account balance.
      </div>
      Are you sure you want to delete the transaction from {transactionDate} with description &quot;{transactionDescription}&quot;?
    </React.Fragment>
  );
}
