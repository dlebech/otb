import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SortIndicator = props => {
  const icon = !props.active ? 'sort' : props.ascending ? 'sort-up' : 'sort-down';
  return (
    <span className="px-1">
      <FontAwesomeIcon icon={icon} />
    </span>
  );
};

SortIndicator.propTypes = {
  ascending: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired
};

const SortHeader = props => {
  return (
    <th
      scope="col"
      className="text-nowrap"
      onClick={() => props.handleSortChange(props.sortKey, !props.sortAscending)}
    >
      {props.label}
      <SortIndicator
        ascending={props.sortAscending}
        active={props.sortKey === props.activeSortKey}
      />
    </th>
  );
};

SortHeader.propTypes = {
  label: PropTypes.string.isRequired,
  sortKey: PropTypes.string.isRequired,
  activeSortKey: PropTypes.string.isRequired,
  sortAscending: PropTypes.bool.isRequired,
  handleSortChange: PropTypes.func.isRequired
};

export default SortHeader;
