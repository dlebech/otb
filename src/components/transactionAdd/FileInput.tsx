import React, { useState, useCallback, useRef } from 'react';

interface FileInputProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFile: (file: File) => void;
}

export default function FileInput({ handleFileChange, handleFile }: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="flex flex-col items-center py-8">
      <div
        className={`w-full max-w-lg rounded-xl border-2 border-dashed px-8 py-12 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="mb-4 text-4xl text-gray-400">
          {isDragging ? '\u2B07' : '\uD83D\uDCC4'}
        </div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          {isDragging ? 'Drop your file here' : 'Drag & drop a file here, or click to browse'}
        </p>
        <p className="text-xs text-gray-500">CSV or Excel (.xlsx, .xls)</p>
        <input
          ref={inputRef}
          type="file"
          id="transactions-input"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />
      </div>
      <p className="mt-3 text-xs text-gray-400">
        The file is not sent anywhere. It is processed in your browser only.
      </p>
    </div>
  );
}
