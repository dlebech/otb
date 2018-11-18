import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import Creatable from 'react-select/lib/Creatable';
import { uncategorized } from '../../data/categories';

const findValue = (value, options) => {
  if (value instanceof Set) value = Array.from(value);

  // If we are given an array of strings, select the options with the value of
  // those strings.
  if (Array.isArray(value) && value.length && typeof value[0] === 'string') {
    return options.filter(o => !!value.find(c => c === o.value));
  }
  if (typeof value === 'string') {
    return options.find(o => o.value === value);
  }
  return value;
};

const CategorySelect = props => {
  const onChange = (option, action) => {
    if (action.action !== 'select-option' &&
      action.action !== 'remove-value' &&
      action.action !== 'clear') {
      return;
    }

    props.onChange(option);
  };

  const selectedCategory = findValue(props.selectedCategory, props.categoryOptions);

  const commonProps = {
    options: props.categoryOptions,
    placeholder: props.placeholder,
    onChange: onChange,
    value: selectedCategory,
    isMulti: props.isMulti,
    autoFocus: props.focus,
    ...props.selectOptions
  };

  // Assume it's a creatable if the onCreate function is given
  if (props.onCreate) {
    const onCreateOption = name => {
      props.onCreate(name);
    };

    return (
      <Creatable
        className="category-select creatable"
        onCreateOption={onCreateOption}
        {...commonProps}
      />
    );
  }

  return (
    <Select
      className="category-select"
      {...commonProps}
    />
  );
};

CategorySelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  categoryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  selectedCategory: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  placeholder: PropTypes.string,
  isMulti: PropTypes.bool,
  focus: PropTypes.bool,
  includeUncategorized: PropTypes.bool,
  selectOptions: PropTypes.object
};

CategorySelect.defaultProps = {
  placeholder: 'Select category...',
  isMulti: true,
  focus: false,
  includeUncategorized: true,
  selectOptions: {}
};

const mapStateToProps = state => {
  const categories = state.categories.data
    .reduce((obj, category) => {
      obj[category.id] = category;
      return obj;
    }, {});

  const categoryOptions = Object.values(categories)
    .map(category => ({
      label: category.parent ?
        `${categories[category.parent].name} - ${category.name}` :
        category.name,
      value: category.id
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

    const categoryOptionsWithUncategorized = [
      {
        label: uncategorized.name,
        value: uncategorized.id
      }
    ].concat(categoryOptions);

  return {
    categoryOptions: categoryOptionsWithUncategorized
  };
};

export default connect(mapStateToProps)(CategorySelect);
