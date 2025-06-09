import React, { useState, useEffect } from 'react';

interface Props {
  searchText?: string;
  handleSearch: (searchText: string) => void;
}

export default function SearchField({ searchText = '', handleSearch }: Props) {
  const [internalSearchText, setInternalSearchText] = useState(searchText);

  useEffect(() => {
    setInternalSearchText(searchText);
  }, [searchText]);

  const handleSearchInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalSearchText(newValue);
    handleSearch(newValue);
  };

  return (
    <input
      type="text"
      placeholder="Search for a transaction"
      className="form-control form-col-auto"
      value={internalSearchText}
      onChange={handleSearchInternal}
    />
  );
}
