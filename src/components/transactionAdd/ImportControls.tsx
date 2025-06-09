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
    <div className="form-row my-2">
      <label htmlFor="skip-rows" className="col-form-label">Rows To Skip:</label>
      <div className="col-auto">
        <input
          type="number"
          id="skip-rows"
          className="form-control"
          onChange={handleSkipRowsChange}
          min="0"
          value={skipRows}
        />
      </div>
      <label htmlFor="account" className="col-form-label">Account:</label>
      <div className="col-auto">
        <select
          id="account"
          className="form-control"
          value={selectedAccount}
          onChange={e => handleAccountChange(e.target.value)}
        >
          <option value=""></option>
          {accounts.map(a => {
            return <option key={`account-${a.id}`} value={a.id}>{a.name}</option>
          })}
        </select>
      </div>
      <div className="col-auto">
        <div className="form-check">
          <input
            type="checkbox"
            id="skip-duplicates-check"
            className="form-check-input"
            checked={skipDuplicates}
            onChange={e => handleSkipDuplicatesChange(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="skip-duplicates-check">
            Skip duplicates
            <FontAwesomeIcon
              icon="question-circle"
              className="ms-1 cursor-help"
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
      <div className="col-auto">
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
