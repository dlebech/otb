import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const customStyles = {
  control: (base, state) => ({
    ...base,
    width: 150
  })
};

/**
 * A select list for choosing a category.
 */
const CategorySelect = props => {
  const onChange = (option, action) => {
    if (action.action === 'select-option') {
      props.handleRowCategory(props.transactionId, option.value)
    }
  };

  return (
    <Select
      value={props.selectedValue}
      options={props.options}
      onChange={onChange}
      styles={customStyles}
    />
  );
};

CategorySelect.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  transactionId: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  categoryConfirmedId: PropTypes.string
};

export default CategorySelect;
