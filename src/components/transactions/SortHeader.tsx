import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

interface SortIndicatorProps {
  ascending: boolean;
  active: boolean;
}

function SortIndicator({ ascending, active }: SortIndicatorProps) {
  const icon = !active ? faSort : ascending ? faSortUp : faSortDown;
  return (
    <span className="px-1">
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}

interface Props {
  label: string;
  sortKey: string;
  activeSortKey: string;
  sortAscending: boolean;
  handleSortChange: (sortKey: string, ascending: boolean) => void;
  className?: string;
}

export default function SortHeader({
  label,
  sortKey,
  activeSortKey,
  sortAscending,
  handleSortChange,
  className = ''
}: Props) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap cursor-pointer${className ? (' ' + className) : ''}`}
      onClick={() => handleSortChange(sortKey, !sortAscending)}
    >
      {label}
      <SortIndicator
        ascending={sortAscending}
        active={sortKey === activeSortKey}
      />
    </th>
  );
}
