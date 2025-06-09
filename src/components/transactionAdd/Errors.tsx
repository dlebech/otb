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
    <div className="row">
      <div className="col">
        <div className="alert alert-danger" role="alert">
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
