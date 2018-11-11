import React from 'react';
import PropTypes from 'prop-types';
import Creatable from 'react-select/lib/Creatable';

/**
 * A select list for choosing a category.
 */
const CategorySelect = props => {
  const onChange = (option, action) => {
    if (action.action === 'select-option') {
      props.handleCategoryChange(option);
    }
  };

  const onCreateOption = name => {
    props.handleCreateCategory(name);
  };

  let value = props.selectedValue;
  if (typeof value === 'string') value = props.options.find(o => o.value === props.selectedValue);

  return (
    <Creatable
      className="category-select"
      placeholder={props.placeholder}
      options={props.options}
      value={value}
      onChange={onChange}
      onCreateOption={onCreateOption}
      autoFocus={props.focus}
    />
  );
};

CategorySelect.propTypes = {
  handleCategoryChange: PropTypes.func.isRequired,
  handleCreateCategory: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  selectedValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ value: PropTypes.string.isRequired })
  ]),
  placeholder: PropTypes.string,
  focus: PropTypes.bool
};

CategorySelect.defaultProps = {
  placeholder: 'Select category...',
  focus: false
};

export default CategorySelect;
