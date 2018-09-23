import React from 'react';
import PropTypes from 'prop-types';

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

const PreviewTable = props => {
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
};

PreviewTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.array).isRequired,
  columnSpec: PropTypes.arrayOf(PropTypes.object).isRequired,
  skipRows: PropTypes.number.isRequired,
  handleColumnTypeChange: PropTypes.func.isRequired
};

export default PreviewTable;