import React from 'react';

interface Props {
  nameToDelete: string;
  numTransactions?: number;
}

export default function ConfirmDelete({ nameToDelete, numTransactions = 0 }: Props) {
  return (
    <React.Fragment>
      {numTransactions > 0 && <div className="alert alert-danger">
        Deleting &quot;{nameToDelete}&quot; will affect {numTransactions} transactions.
        These transactions will be reset for &quot;{nameToDelete}&quot;.
      </div>}
      Are you sure you want to delete &quot;{nameToDelete}&quot;?
    </React.Fragment>
  );
}
