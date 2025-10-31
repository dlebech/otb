import React from 'react';
import CategorySelect from '../shared/CategorySelect';
import CategoryTreeMap from './CategoryTreeMap';
import CategoryLine from './CategoryLine';
import { Transaction, Category } from '../../types/redux';

interface CategoryOption {
  label: string;
  value: string;
}

interface CategoryExpense {
  value: {
    amount: number;
    category: Category;
    transactions: Transaction[];
  };
}

interface Props {
  handleCategoryChange: (categoryIds: string[]) => void;
  filterCategories: Set<string>;
  categories: Record<string, Category>;
  startDate: any; // moment object
  endDate: any; // moment object
  sortedCategoryExpenses: CategoryExpense[];
}

const getFilterCategories = (categoryMapping: Record<string, Category>, filterCategories: Set<string>): Set<string> => {
  const actualFilterCategories = new Set<string>();

  for (const categoryId of filterCategories) {
    actualFilterCategories.add(categoryId);

    // If this is a parent category (meaning it does not have a parent itself),
    // find all children and add them as well.
    if (categoryMapping[categoryId] && !categoryMapping[categoryId].parent) {
      for (const [, category] of Object.entries(categoryMapping)) {
        if (category.parent === categoryId) {
          actualFilterCategories.add(category.id);
        }
      }
    }
  }

  return actualFilterCategories;
};

export default function CategoryExpenses({
  handleCategoryChange,
  filterCategories,
  categories,
  startDate,
  endDate,
  sortedCategoryExpenses
}: Props) {
  const handleCategoryChangeInternal = (options: CategoryOption | CategoryOption[] | null) => {
    // Options is sometimes null
    const safeOptions = Array.isArray(options) ? options : (options ? [options] : []);
    handleCategoryChange(safeOptions.map(o => o.value));
  };

  let filteredExpenses = sortedCategoryExpenses;

  // Filter the categories, if requested
  if (filterCategories.size > 0) {
    const actualFilterCategories = getFilterCategories(categories, filterCategories);
    filteredExpenses = filteredExpenses
      .filter(e => actualFilterCategories.has(e.value.category.id));
  }

  // Find the largest categories in terms of number of transactions
  // Note: Need to copy the array to ensure the sort does not mess with other
  // components view of this array.
  const largestCategoriesByVolume = [...filteredExpenses] 
    .sort((a, b) => b.value.transactions.length - a.value.transactions.length)
    .slice(0, 4);
  const largestCategoriesByAmount = [...filteredExpenses] 
    .sort((a, b) => b.value.amount - a.value.amount)
    .slice(0, 4);

  return (
    <>
      <div className="row">
        <div className="col">
          <h4 className="text-center">Categories where money is spent</h4>
        </div>
      </div> 
      <div className="row justify-content-center">
        <div className="col-md-4">
          <CategorySelect
            selectedCategory={filterCategories}
            onChange={handleCategoryChangeInternal}
            selectOptions={
              {
                placeholder: "Filter categories...",
                closeMenuOnSelect: false
              }
            }
          />
          <small className="form-text text-muted">
            When selecting a parent category, all child categories are automatically included as well.
          </small>
        </div>
      </div>
      {filteredExpenses.length > 0 && <div className="row justify-content-center mt-3">
        <div className="col-lg-6">
          <h5 className="text-center">Most common categories</h5>
          <CategoryLine
            sortedCategoryExpenses={largestCategoriesByVolume}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
        <div className="col-lg-6">
          <h5 className="text-center">Most expensive categories</h5>
          <CategoryLine
            sortedCategoryExpenses={largestCategoriesByAmount}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>}
      <div className="row mt-3">
        <div className="col">
          <CategoryTreeMap sortedCategoryExpenses={sortedCategoryExpenses} />
        </div>
      </div>
    </>
  )
}
