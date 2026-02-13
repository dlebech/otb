import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
// @ts-ignore - No types available for creatable
import CreatableSelect from 'react-select/creatable';
import { uncategorized } from '../../data/categories';
import { arrayToObjectLookup } from '../../util';
import type { RootState } from '../../reducers';

interface CategoryOption {
  label: string;
  value: string;
}

interface Props {
  onChange: (option: CategoryOption[] | CategoryOption | null) => void;
  onCreate?: (name: string) => void;
  selectedCategory?: any; // Could be Set, array, or object
  placeholder?: string;
  isMulti?: boolean;
  focus?: boolean;
  includeUncategorized?: boolean;
  selectOptions?: Record<string, any>;
}

const findValue = (value: any, options: CategoryOption[]) => {
  if (value instanceof Set) value = Array.from(value);

  // If we are given an array of strings, select the options with the value of
  // those strings.
  if (Array.isArray(value) && value.length && typeof value[0] === 'string') {
    return options.filter(o => !!value.find((c: string) => c === o.value));
  }
  if (typeof value === 'string') {
    return options.find(o => o.value === value);
  }
  return value;
};

export default function CategorySelect({
  onChange,
  onCreate,
  selectedCategory,
  placeholder = 'Select category...',
  isMulti = true,
  focus = false,
  includeUncategorized = true,
  selectOptions = {}
}: Props) {
  const categories = useSelector((state: RootState) => state.categories.data);

  const categoryOptionsWithUncategorized = useMemo(() => {
    const categoryLookup = arrayToObjectLookup(categories);

    const categoryOptions = Object.values(categoryLookup)
      .map(category => ({
        label: category.parent ?
          `${categoryLookup[category.parent].name} - ${category.name}` :
          category.name,
        value: category.id
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [
      {
        label: uncategorized.name,
        value: uncategorized.id
      }
    ].concat(categoryOptions);
  }, [categories]);

  const onChangeInternal = (option: any) => {
    onChange(option);
  };

  const selectedCategoryValue = useMemo(
    () => findValue(selectedCategory, categoryOptionsWithUncategorized),
    [selectedCategory, categoryOptionsWithUncategorized]
  );

  const commonProps = {
    options: categoryOptionsWithUncategorized,
    placeholder: placeholder,
    onChange: onChangeInternal,
    value: selectedCategoryValue,
    isMulti: isMulti,
    autoFocus: focus,
    ...selectOptions
  };

  // Assume it's a creatable if the onCreate function is given
  if (onCreate) {
    const onCreateOption = (name: string) => {
      onCreate(name);
    };

    return (
      <CreatableSelect
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
}
