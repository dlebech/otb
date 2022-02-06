import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import * as actions from '../actions';
import { detectFileEncoding, cleanNumber, momentParse } from '../util';
import Form from './transactionAdd/Form';
import PreviewTable from './transactionAdd/PreviewTable';
import Errors from './transactionAdd/Errors';

class TransactionAdd extends React.Component {
  constructor(props) {
    super(props);

    this.validateForm = this.validateForm.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);

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

    if (!this.props.account) {
      errors.push({
        type: 'account',
        message: 'Account is required'
      });
    }

    this.setState({ errors });
    return errors.length === 0;
  }

  handleSave() {
    if (!this.validateForm()) return;
    this.props.handleSave();
    this.props.history.push('/transactions');
  }

  async handleFormChange(propsFun, ...args) {
    await propsFun(...args);
    this.validateForm();
  }

  async handleFileChange(...args) {
    try {
      await this.props.handleFileChange(...args);
      this.setState({ errors: [] });
    } catch (err) {
      const errors = Array.isArray(err) ? err : [{
        type: 'upload',
        message: 'Could not parse the transactions file'
      }];
      this.setState({ errors });
    }
  }

  render() {
    return (
      <>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/transactions">Transactions</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Add</li>
          </ol>
        </nav>
        <Errors errors={this.state.errors} />
        <Form
          handleFileChange={this.handleFileChange}
          handleSkipRowsChange={this.handleFormChange.bind(this, this.props.handleSkipRowsChange)}
          handleSkipDuplicatesChange={this.props.handleSkipDuplicatesChange}
          handleSave={this.handleSave}
          handleCancel={this.props.handleCancel}
          hasTransactions={!!this.props.transactions && this.props.transactions.length > 0}
          skipRows={this.props.skipRows}
          skipDuplicates={this.props.skipDuplicates}
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

TransactionAdd.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.array).isRequired,
  accounts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  })).isRequired,
  skipRows: PropTypes.number.isRequired,
  skipDuplicates: PropTypes.bool.isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.object),
  handleFileChange: PropTypes.func.isRequired,
  handleSkipRowsChange: PropTypes.func.isRequired,
  handleSkipDuplicatesChange: PropTypes.func.isRequired,
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
    skipDuplicates: state.transactions.import.skipDuplicates,
    columnSpec: state.transactions.import.columnSpec,
    dateFormat: state.transactions.import.dateFormat,
    accounts: state.accounts.data
  };
};

const handleCsv = async (fileOrString, dispatch) => {
  const [encodingResult, Papa] = await Promise.all([
    detectFileEncoding(fileOrString),
    import('papaparse').then(m => m.default)
  ]);

  return new Promise((resolve, reject) => {
    Papa.parse(fileOrString, {
      encoding: encodingResult.encoding,
      skipEmptyLines: true,
      error: err => {
        reject(err);
      },
      complete: result => {
        if (result.errors && result.errors.length > 0) {
          return reject(result.errors);
        }
        // Papaparse seems to be quite forgiving around the input format So
        // as an early sanity test, check that the parsed number of columns
        // is the same for all rows.
        if (!result.data.every(d => d.length === result.data[0].length)) {
          return reject([{
            type: 'upload',
            message: 'Cannot parse the file. The number of columns varies between rows'
          }]);
        }
        dispatch(actions.importParseTransactionsEnd(result.data));
        resolve();
      }
    });
  });
};

const sheetToCsv = async file => {
  const XLSX = await import('xlsx').then(m => m.default);
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]])
      resolve(csv);
    };
    reader.readAsArrayBuffer(file);
  });
};

const mapDispatchToProps = dispatch => {
  return {
    handleFileChange: async e => {
      // File needs to be extracted here, because it is unavailable after the
      // dynamic import below for some reason.
      try {
        let file = e.target.files[0];
        dispatch(actions.importParseTransactionsStart());

        // Full mimetype for Excel sheets is
        // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        // but to keep things simple, just search for the word sheet in the type
        // Convert Excel sheets to CSV before parsing.
        if (file.type.includes('sheet')) {
          file = await sheetToCsv(file);
        }

        await handleCsv(file, dispatch);
      } catch (err) {
        dispatch(actions.importParseTransactionsEnd([]));
        throw err;
      }
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
    },
    handleSkipDuplicatesChange: enabled => {
      return dispatch(actions.importSetSkipDuplicates(enabled));
    }
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TransactionAdd)
);