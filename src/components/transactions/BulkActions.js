import React from 'react';
import PropTypes from 'prop-types';
import BulkActionSelection from './BulkActionSelection';

const SelectionIntro = props => {
  return (
    <div className="d-inline-flex">
      <small>Bulk actions:</small>
      <small className="text-muted cursor-pointer ml-2" onClick={props.handleSelectAll}><u>Select all rows</u></small>
      {props.selectedTransactions.length === 0 && 
        <small className="text-muted ml-2">(or click on a row&#39;s date or description to select it)</small>}
      {props.selectedTransactions.length >= 1 &&
        <>
          <small className="text-muted cursor-pointer ml-2" onClick={props.handleSelectNone}><u>Clear selection</u></small>
          <small className="text-muted ml-2" >
            ({props.selectedTransactions.length} transaction{props.selectedTransactions.length > 1 ? 's': ''} selected)
          </small>
        </>}
    </div>
  );
};

const BulkActions = props => {
  return (
    <>
      <SelectionIntro
        selectedTransactions={props.selectedTransactions}
        handleSelectAll={props.handleSelectAll}
        handleSelectNone={props.handleSelectNone}
      />
      <BulkActionSelection
        selectedTransactions={props.selectedTransactions}
        handleRowCategoryChange={props.handleRowCategoryChange}
        categoryOptions={props.categoryOptions}
        showCreateCategoryModal={props.showCreateCategoryModal}
      />
    </>
  );
};

BulkActions.propTypes = {
  selectedTransactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    categoryGuess: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }),
  })).isRequired,
  handleRowCategoryChange: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
  handleSelectNone: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  showCreateCategoryModal: PropTypes.func.isRequired
};

export default BulkActions;
