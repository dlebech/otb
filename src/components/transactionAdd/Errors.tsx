import React from 'react';

interface Error {
  type: string;
  message: string;
}

interface ErrorsProps {
  errors?: Error[];
}

export default function Errors({ errors = [] }: ErrorsProps) {
  if (!Array.isArray(errors) || errors.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex-1">
        <div className="rounded border border-red-300 bg-red-50 p-6 text-red-800" role="alert">
          <ul className="my-0">
            {errors.map((e, i) => {
              return <li key={`error-message-${i}-${e.message}`}>{e.message}</li>
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
