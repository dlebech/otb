import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
// @ts-expect-error - No types available for creatable
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
  selectedCategory?: Set<string> | string[] | string | CategoryOption[] | null;
  placeholder?: string;
  isMulti?: boolean;
  focus?: boolean;
  includeUncategorized?: boolean;
  selectOptions?: Record<string, unknown>;
}

const findValue = (value: Set<string> | string[] | string | CategoryOption[] | null | undefined, options: CategoryOption[]) => {
  const normalizedValue = value instanceof Set ? Array.from(value) : value;

  // If we are given an array of strings, select the options with the value of
  // those strings.
  if (Array.isArray(normalizedValue) && normalizedValue.length && typeof normalizedValue[0] === 'string') {
    const stringValues = normalizedValue as string[];
    return options.filter(o => !!stringValues.find((c: string) => c === o.value));
  }
  if (typeof normalizedValue === 'string') {
    return options.find(o => o.value === normalizedValue);
  }
  return normalizedValue;
};

export default function CategorySelect({
  onChange,
  onCreate,
  selectedCategory,
  placeholder = 'Select category...',
  isMulti = true,
  focus = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const onChangeInternal = (option: CategoryOption | CategoryOption[] | null) => {
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
