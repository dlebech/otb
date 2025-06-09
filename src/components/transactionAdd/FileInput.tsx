import React from 'react';

interface FileInputProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput({ handleFileChange }: FileInputProps) {
  return (
    <div className="form-row">
      <div className="col-auto">
        <label htmlFor="transactions-input">Transactions file (CSV or Excel sheet):</label>
        <input
          type="file"
          id="transactions-input"
          className="form-control-file"
          onChange={handleFileChange}
        />
        <small className="form-text text-muted">
          The file is not sent anywhere. It is processed in your browser only.
        </small>
      </div>
    </div>
  );
}
