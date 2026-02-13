import React from 'react';

interface FileInputProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileInput({ handleFileChange }: FileInputProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-auto">
        <label htmlFor="transactions-input">Transactions file (CSV or Excel sheet):</label>
        <input
          type="file"
          id="transactions-input"
          className=""
          onChange={handleFileChange}
        />
        <small className="text-sm text-gray-500">
          The file is not sent anywhere. It is processed in your browser only.
        </small>
      </div>
    </div>
  );
}
