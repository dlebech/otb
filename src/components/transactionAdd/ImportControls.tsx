import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Account } from '../../types/redux';

interface ImportControlsProps {
  skipRows: number;
  skipDuplicates: boolean;
  handleSkipRowsChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSkipDuplicatesChange: (checked: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleAccountChange: (accountId: string) => void;
  accounts: Account[];
  selectedAccount: string;
}

export default function ImportControls({
  skipRows,
  skipDuplicates,
  handleSkipRowsChange,
  handleSkipDuplicatesChange,
  handleSave,
  handleCancel,
  handleAccountChange,
  accounts,
  selectedAccount
}: ImportControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 my-2">
      <label htmlFor="skip-rows" className="text-sm font-medium">Rows To Skip:</label>
      <div className="w-auto">
        <input
          type="number"
          id="skip-rows"
          className="block w-full rounded border border-gray-300 px-3 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleSkipRowsChange}
          min="0"
          value={skipRows}
        />
      </div>
      <label htmlFor="account" className="text-sm font-medium">Account:</label>
      <div className="w-auto">
        <select
          id="account"
          className="block w-full rounded border border-gray-300 px-3 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedAccount}
          onChange={e => handleAccountChange(e.target.value)}
        >
          <option value=""></option>
          {accounts.map(a => {
            return <option key={`account-${a.id}`} value={a.id}>{a.name}</option>
          })}
        </select>
      </div>
      <div className="w-auto">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="skip-duplicates-check"
            className="mr-2"
            checked={skipDuplicates}
            onChange={e => handleSkipDuplicatesChange(e.target.checked)}
          />
          <label className="text-sm" htmlFor="skip-duplicates-check">
            Skip duplicates
            <FontAwesomeIcon
              icon="question-circle"
              className="ml-1 cursor-help"
              data-tooltip-id="skip-duplicates-tt" data-tooltip-content=""
              
            />
          </label>
          <Tooltip
            id="skip-duplicates-tt"
            className="small-tip"
          >
            If enabled, imported transactions will be skipped if they match
            an existing transaction with exactly the same date, description,
            amount and total.
          </Tooltip>
        </div>
      </div>
      <div className="w-auto">
        <button type="button" className="inline-flex items-center justify-center rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 px-4 py-2" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="inline-flex items-center justify-center rounded font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 ml-2" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
