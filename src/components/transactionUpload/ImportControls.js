import React from 'react';
import PropTypes from 'prop-types';

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
  handleSkipRowsChange: PropTypes.func.isRequired,
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