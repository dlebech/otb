import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import * as actions from '../actions';
import { detectFileEncoding, cleanNumber, momentParse } from '../util';
import UploadForm from './transactionUpload/UploadForm';
import PreviewTable from './transactionUpload/PreviewTable';
import Errors from './transactionUpload/Errors';

class TransactionUpload extends React.Component {
  constructor(props) {
    super(props);

    this.validateForm = this.validateForm.bind(this);
    this.handleSave = this.handleSave.bind(this);

    this.state = { errors: [] };
  }

  validateForm() {
    // Ensure date, description and amount
    const errors = [];

    const specTypes = new Set(this.props.columnSpec.map(s => s.type));
    let checkDates = false;
    let checkAmounts = false;
    if (!specTypes.has('date')) {
      errors.push({
        type: 'columnSpec',
        message: 'Please select a date column'
      })
    } else checkDates = true;

    if (!specTypes.has('amount')) {
      errors.push({
        type: 'columnSpec',
        message: 'Please select an amount column'
      })
    } else checkAmounts = true;

    if (!specTypes.has('description')) {
      errors.push({
        type: 'columnSpec',
        message: 'Please select a description column'
      })
    }

    if (checkDates || checkAmounts) {
      const amountIndex = this.props.columnSpec.findIndex(c => c.type === 'amount');
      const dateIndex = this.props.columnSpec.findIndex(c => c.type === 'date');

      for (let t of this.props.transactions) {
        if (checkDates && !momentParse(t[dateIndex], this.props.dateFormat).isValid()) {
          errors.push({
            type: 'date',
            message: 'Cannot parse all dates correctly, ' +
              'perhaps you need to skip a header, or change the date format?'
          });
          break; // Exit early
        };

        if (checkAmounts && !cleanNumber(t[amountIndex])) {
          errors.push({
            type: 'amount',
            message: 'Cannot parse all amounts as numbers, perhaps you need to skip a header?'
          });
          break; // Exit early
        };
      }
    }

    this.setState({ errors });
    return errors.length === 0;
  }

  handleSave() {
    // TODO: add validation
    if (!this.validateForm()) return;
    this.props.handleSave();
    this.props.history.push('/transactions');
  }

  async handleFormChange(propsFun, ...args) {
    await propsFun(...args);
    this.validateForm();
  }

  render() {
    return (
      <>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/transactions">Transactions</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Upload</li>
          </ol>
        </nav>
        <Errors errors={this.state.errors} />
        <UploadForm
          handleFileChange={this.props.handleFileChange}
          handleSkipRowsChange={this.handleFormChange.bind(this, this.props.handleSkipRowsChange)}
          handleSave={this.handleSave}
          handleCancel={this.props.handleCancel}
          hasTransactions={!!this.props.transactions && this.props.transactions.length > 0}
          skipRows={this.props.skipRows}
          handleAccountChange={this.handleFormChange.bind(this, this.props.handleAccountChange)}
          accounts={this.props.accounts}
          selectedAccount={this.props.account}
        />
        <PreviewTable
          transactions={this.props.transactions}
          columnSpec={this.props.columnSpec}
          dateFormat={this.props.dateFormat}
          handleColumnTypeChange={this.handleFormChange.bind(this, this.props.handleColumnTypeChange)}
          handleDateFormatChange={this.handleFormChange.bind(this, this.props.handleDateFormatChange)}
        />
      </>
    );
  }
}

TransactionUpload.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.array).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  })).isRequired,
  skipRows: PropTypes.number.isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.object),
  handleFileChange: PropTypes.func.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired,
  handleDateFormatChange: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  let transactions = state.transactions.import.data
  if (state.transactions.import.skipRows) {
    transactions = transactions.slice(state.transactions.import.skipRows);
  }

  return {
    transactions,
    account: state.transactions.import.account,
    skipRows: state.transactions.import.skipRows,
    columnSpec: state.transactions.import.columnSpec,
    dateFormat: state.transactions.import.dateFormat,
    accounts: state.accounts.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleFileChange: async e => {
      // File needs to be extracted here, because it is unavailable after the
      // dynamic import below for some reason.
      const file = e.target.files[0];

      dispatch(actions.importParseTransactionsStart());

      const [encodingResult, Papa] = await Promise.all([
        detectFileEncoding(file),
        import('papaparse').then(m => m.default)
      ]);

      Papa.parse(file, {
        encoding: encodingResult.encoding, 
        skipEmptyLines: true,
        complete: result => {
          // TODO handle errors results.errors, 
          dispatch(actions.importParseTransactionsEnd(result.data));
        }
      });
    },
    handleSkipRowsChange: e => {
      return dispatch(actions.importUpdateSkipRows(Number(e.target.value)))
    },
    handleColumnTypeChange: (columnIndex, columnType) => {
      return dispatch(actions.importUpdateColumnType(columnIndex, columnType));
    },
    handleSave: () => {
      return dispatch(actions.importSaveTransactions());
    },
    handleCancel: () => {
      return dispatch(actions.importCancelTransactions());
    },
    handleAccountChange: accountId => {
      return dispatch(actions.importUpdateAccount(accountId));
    },
    handleDateFormatChange: dateFormat => {
      return dispatch(actions.importSetDateFormat(dateFormat));
    }
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TransactionUpload)
);