import React, { useState, useDeferredValue, useEffect, useRef } from 'react';

interface Props {
  searchText?: string;
  handleSearch: (searchText: string) => void;
}

export default function SearchField({ searchText = '', handleSearch }: Props) {
  const [internalSearchText, setInternalSearchText] = useState(searchText);
  const searchValue = useDeferredValue(internalSearchText);
  const handleSearchRef = useRef(handleSearch);
  handleSearchRef.current = handleSearch;

  useEffect(() => {
    handleSearchRef.current(searchValue);
  }, [searchValue]);

  const handleSearchInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchText(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search for a transaction"
      className="block w-full rounded border border-gray-300 px-3 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      value={internalSearchText}
      onChange={handleSearchInternal}
    />
  );
}
