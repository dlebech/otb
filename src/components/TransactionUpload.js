import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import * as actions from '../actions';

const UploadForm = props => {
  return (
    <form>
      {!props.hasTransactions && <div className="form-row">
        <div className="col-auto">
          <label htmlFor="transactions-input">Transactions file:</label>
          <input
            type="file"
            id="transactions-input"
            className="form-control-file"
            onChange={props.handleFileChange}
          />
        </div>
      </div>}
      {props.hasTransactions &&
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
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              props.handleSave();
              props.history.push('/transactions')
            }}
          >
            Save
          </button>
          <button type="button" className="btn btn-secondary ml-2" onClick={props.handleCancel}>
            Cancel
          </button>
        </div>
      </div>}
    </form>
  );
};

const ColumnType = props => {
  return (
    <select
      className="form-control"
      value={props.selectedValue}
      onChange={e => props.handleColumnTypeChange(props.index, e.target.value)}
    >
      <option value="">Column Type</option>
      <option value="date">Date</option>
      <option value="description">Description</option>
      <option value="amount">Amount</option>
      <option value="total">Total</option>
    </select>
  )
};

const ColumnHeader = props => {
  return (
    <th>
      <ColumnType
        selectedValue={props.columnSpec[props.index].type}
        index={props.index}
        handleColumnTypeChange={props.handleColumnTypeChange}
      />
    </th>
  )
};

const TransactionsPreviewTable = props => {
  if (props.transactions.length === 0) return null;

  const data = props.transactions.slice(props.skipRows);
  const numColumns = data[0].length;

  const headers = [];
  for (let i = 0; i < numColumns; i++) {
    headers.push(<ColumnHeader
      key={`col-th-${i}`}
      index={i}
      columnSpec={props.columnSpec}
      handleColumnTypeChange={props.handleColumnTypeChange}
    />);
  }

  return (
    <div className="row justify-content-center">
      <div className="col">
        <table className="table table-striped">
          <thead>
            <tr>
              {headers}
            </tr>
          </thead>
          <tbody>
            {data.map((transaction, i) => {
              return <tr key={`row-${i}`}>
                {transaction.map((column, j) => {
                  return <td key={`col-${i}-${j}`}>{column}</td>
                })}
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const TransactionUpload = props => {
  return (
    <React.Fragment>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/transactions">Transactions</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Upload</li>
        </ol>
      </nav>
      <UploadForm
        handleFileChange={props.handleFileChange}
        handleSkipRowsChange={props.handleSkipRowsChange}
        handleSave={props.handleSave}
        handleCancel={props.handleCancel}
        history={props.history}
        hasTransactions={!!props.transactions && props.transactions.length > 0}
        skipRows={props.skipRows}
      />
      <TransactionsPreviewTable
        transactions={props.transactions}
        skipRows={props.skipRows}
        columnSpec={props.columnSpec}
        handleColumnTypeChange={props.handleColumnTypeChange}
      />
    </React.Fragment>
  );
};

TransactionUpload.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.array).isRequired,
  skipRows: PropTypes.number.isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.object),
  handleFileChange: PropTypes.func.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    transactions: state.transactions.import.data,
    skipRows: state.transactions.import.skipRows,
    columnSpec: state.transactions.import.columnSpec
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleFileChange: async e => {
      // File needs to be extracted here, because it is unavailable after the
      // dynamic import below for some reason.
      const file = e.target.files[0];

      dispatch(actions.parseTransactionsStart());

      const Papa = await import('papaparse');
      Papa.parse(file, {
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: results => dispatch(actions.parseTransactionsEnd(results.errors, results.data))
      });
    },
    handleSkipRowsChange: e => {
      dispatch(actions.updateSkipRows(Number(e.target.value)))
    },
    handleColumnTypeChange: (columnIndex, columnType) => {
      dispatch(actions.updateColumnType(columnIndex, columnType));
    },
    handleSave: () => {
      dispatch(actions.saveTransactions());
    },
    handleCancel: () => {
      dispatch(actions.cancelTransactions());
    }
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TransactionUpload)
);