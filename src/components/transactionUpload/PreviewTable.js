import React from 'react';
import PropTypes from 'prop-types';

const DateFormat = props => {
  return (
    <select
      className="form-control"
      value={props.dateFormat}
      onChange={e => props.handleDateFormatChange(e.target.value)}
    >
      <option value="">Guess (not recommended)</option>
      <option value="YYYY-MM-DD">Year - Month - Date</option>
      <option value="DD-MM-YYYY">Date - Month - Year</option>
      <option value="MM-DD-YYYY">Month - Date - Year</option>
    </select>
  );
};

DateFormat.propTypes = {
  dateFormat: PropTypes.string.isRequired,
  handleDateFormatChange: PropTypes.func.isRequired
};

const ColumnType = props => {
  return (
    <React.Fragment>
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
      {props.selectedValue === 'date' && <DateFormat
        dateFormat={props.dateFormat}
        handleDateFormatChange={props.handleDateFormatChange}
      />}
    </React.Fragment>
  );
};

ColumnType.propTypes = {
  index: PropTypes.number.isRequired,
  selectedValue: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired,
  handleDateFormatChange: PropTypes.func.isRequired
};

const ColumnHeader = props => {
  return (
    <th>
      <ColumnType
        selectedValue={props.columnSpec[props.index].type}
        index={props.index}
        dateFormat={props.dateFormat}
        handleColumnTypeChange={props.handleColumnTypeChange}
        handleDateFormatChange={props.handleDateFormatChange}
      />
    </th>
  )
};

ColumnHeader.propTypes = {
  index: PropTypes.number.isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired
  })),
  dateFormat: PropTypes.string.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired,
  handleDateFormatChange: PropTypes.func.isRequired
};

const PreviewTable = props => {
  if (props.transactions.length === 0) return null;

  const numColumns = props.transactions[0].length;

  const headers = [];
  for (let i = 0; i < numColumns; i++) {
    headers.push(<ColumnHeader
      key={`col-th-${i}`}
      index={i}
      columnSpec={props.columnSpec}
      dateFormat={props.dateFormat}
      handleColumnTypeChange={props.handleColumnTypeChange}
      handleDateFormatChange={props.handleDateFormatChange}
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
            {props.transactions.map((transaction, i) => {
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
};

PreviewTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.array).isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateFormat: PropTypes.string.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired,
  handleDateFormatChange: PropTypes.func.isRequired
};

export default PreviewTable;