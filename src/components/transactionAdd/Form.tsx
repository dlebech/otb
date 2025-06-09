import React from 'react';
import { Account } from '../../types/redux';
import FileInput from './FileInput';
import ImportControls from './ImportControls';

interface FormProps {
  hasTransactions: boolean;
  skipRows: number;
  skipDuplicates: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSkipRowsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSkipDuplicatesChange: (checked: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleAccountChange: (accountId: string) => void;
  accounts: Account[];
  selectedAccount?: string;
}

export default function Form({
  hasTransactions,
  skipRows,
  skipDuplicates,
  handleFileChange,
  handleSkipRowsChange,
  handleSkipDuplicatesChange,
  handleSave,
  handleCancel,
  handleAccountChange,
  accounts,
  selectedAccount = ''
}: FormProps) {
  return (
    <form>
      {!hasTransactions && <FileInput handleFileChange={handleFileChange} />}
      {hasTransactions && <ImportControls
        skipRows={skipRows}
        skipDuplicates={skipDuplicates}
        handleSkipRowsChange={handleSkipRowsChange}
        handleSkipDuplicatesChange={handleSkipDuplicatesChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleAccountChange={handleAccountChange}
        accounts={accounts}
        selectedAccount={selectedAccount}
      />}
    </form>
  );
}
