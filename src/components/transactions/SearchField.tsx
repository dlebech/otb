import React, { useState, useMemo, useDeferredValue, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';

interface Props {
  searchText?: string;
  handleSearch: (searchText: string) => void;
}

export default function SearchField({ searchText = '', handleSearch }: Props) {
  const [internalSearchText, setInternalSearchText] = useState(searchText);
  const searchValue = useDeferredValue(internalSearchText);

  useEffect(() => {
    handleSearch(searchValue);
  }, [handleSearch, searchValue]);

  const handleSearchInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchText(e.target.value);
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
