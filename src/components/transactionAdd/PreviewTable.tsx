import React from 'react';

interface ColumnSpecItem {
  type: string;
}

interface DateFormatProps {
  dateFormat: string;
  handleDateFormatChange: (format: string) => void;
}

function DateFormat({ dateFormat, handleDateFormatChange }: DateFormatProps) {
  return (
    <select
      className="form-control"
      value={dateFormat}
      onChange={e => handleDateFormatChange(e.target.value)}
    >
      <option value="">Guess (not recommended)</option>
      <option value="YYYY-MM-DD">Year - Month - Date</option>
      <option value="DD-MM-YYYY">Date - Month - Year</option>
      <option value="MM-DD-YYYY">Month - Date - Year</option>
    </select>
  );
}

interface ColumnTypeProps {
  index: number;
  selectedValue: string;
  dateFormat: string;
  handleColumnTypeChange: (index: number, value: string) => void;
  handleDateFormatChange: (format: string) => void;
}

function ColumnType({
  index,
  selectedValue,
  dateFormat,
  handleColumnTypeChange,
  handleDateFormatChange
}: ColumnTypeProps) {
  return (
    <React.Fragment>
      <select
        className="form-control"
        value={selectedValue}
        onChange={e => handleColumnTypeChange(index, e.target.value)}
      >
        <option value="">Column Type</option>
        <option value="date">Date</option>
        <option value="description">Description</option>
        <option value="amount">Amount</option>
        <option value="total">Total</option>
      </select>
      {selectedValue === 'date' && <DateFormat
        dateFormat={dateFormat}
        handleDateFormatChange={handleDateFormatChange}
      />}
    </React.Fragment>
  );
}

interface ColumnHeaderProps {
  index: number;
  columnSpec: ColumnSpecItem[];
  dateFormat: string;
  handleColumnTypeChange: (index: number, value: string) => void;
  handleDateFormatChange: (format: string) => void;
}

function ColumnHeader({
  index,
  columnSpec,
  dateFormat,
  handleColumnTypeChange,
  handleDateFormatChange
}: ColumnHeaderProps) {
  return (
    <th>
      <ColumnType
        selectedValue={columnSpec[index].type}
        index={index}
        dateFormat={dateFormat}
        handleColumnTypeChange={handleColumnTypeChange}
        handleDateFormatChange={handleDateFormatChange}
      />
    </th>
  )
}

interface PreviewTableProps {
  transactions: string[][];
  columnSpec: ColumnSpecItem[];
  dateFormat: string;
  handleColumnTypeChange: (index: number, value: string) => void;
  handleDateFormatChange: (format: string) => void;
}

export default function PreviewTable({
  transactions,
  columnSpec,
  dateFormat,
  handleColumnTypeChange,
  handleDateFormatChange
}: PreviewTableProps) {
  if (transactions.length === 0) return null;

  const numColumns = transactions[0].length;

  const headers = [];
  for (let i = 0; i < numColumns; i++) {
    headers.push(<ColumnHeader
      key={`col-th-${i}`}
      index={i}
      columnSpec={columnSpec}
      dateFormat={dateFormat}
      handleColumnTypeChange={handleColumnTypeChange}
      handleDateFormatChange={handleDateFormatChange}
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
            {transactions.map((transaction, i) => {
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
