import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ImportControls = props => {
  return (
    <div className="form-row my-2">
      <label htmlFor="skip-rows" className="col-form-label">Rows To Skip:</label>
      <div className="col-auto">
        <input
          type="number"
          id="skip-rows"
          className="form-control"
          onChange={props.handleSkipRowsChange}
          min="0"
          value={props.skipRows}
        />
      </div>
      <label htmlFor="account" className="col-form-label">Account:</label>
      <div className="col-auto">
        <select
          id="account"
          className="form-control"
          value={props.selectedAccount}
          onChange={e => props.handleAccountChange(e.target.value)}
        >
          <option value=""></option>
          {props.accounts.map(a => {
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
            checked={props.skipDuplicates}
            onChange={e => props.handleSkipDuplicatesChange(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="skip-duplicates-check">
            Skip duplicates
            <FontAwesomeIcon
              icon="question-circle"
              className="ml-1 cursor-help"
              data-tip=""
              data-for="skip-duplicates-tt"
            />
          </label>
          <ReactTooltip
            id="skip-duplicates-tt"
            className="small-tip"
          >
            If enabled, imported transactions will be skipped if they match
            an existing transaction with exactly the same date, description,
            amount and total.
          </ReactTooltip>
        </div>
      </div>
      <div className="col-auto">
        <button type="button" className="btn btn-primary" onClick={props.handleSave}>
          Save
        </button>
        <button type="button" className="btn btn-secondary ml-2" onClick={props.handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
};

ImportControls.propTypes = {
  skipRows: PropTypes.number.isRequired,
  skipDuplicates: PropTypes.bool.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSkipDuplicatesChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleAccountChange: PropTypes.func.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  })).isRequired,
  selectedAccount: PropTypes.string.isRequired
};

export default ImportControls;