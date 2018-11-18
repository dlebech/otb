import React from 'react';
import PropTypes from 'prop-types';
import CategorySelect from '../shared/CategorySelect';
import CategoryTreeMap from './CategoryTreeMap';
import CategoryLine from './CategoryLine';

const CategoryExpenses = props => {
  const handleCategoryChange = options => {
    props.handleCategoryChange(options.map(o => o.value));
  };

  let filteredCategories = props.sortedCategoryExpenses;

  // Filter the categories, if requested
  if (props.filterCategories.size > 0) {
    filteredCategories = props.sortedCategoryExpenses
      .filter(e => props.filterCategories.has(e.value.category.id));
  }

  // Find the largest categories in terms of number of transactions
  // Note: Need to copy the array to ensure the sort does not mess with other
  // components view of this array.
  const largestCategoriesByVolume = [...filteredCategories] 
    .sort((a, b) => b.value.transactions.length - a.value.transactions.length)
    .slice(0, 4);
  const largestCategoriesByAmount = [...filteredCategories] 
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
            selectedCategory={props.filterCategories}
            onChange={handleCategoryChange}
            selectOptions={
              {
                placeholder: "Filter categories...",
                closeMenuOnSelect: false
              }
            }
          />
        </div>
      </div>
      {filteredCategories.length > 0 && <div className="row justify-content-center mt-3">
        <div className="col-lg-6">
          <h5 className="text-center">Most common categories</h5>
          <CategoryLine
            sortedCategoryExpenses={largestCategoriesByVolume}
            startDate={props.startDate}
            endDate={props.endDate}
          />
        </div>
        <div className="col-lg-6">
          <h5 className="text-center">Most expensive categories</h5>
          <CategoryLine
            sortedCategoryExpenses={largestCategoriesByAmount}
            startDate={props.startDate}
            endDate={props.endDate}
          />
        </div>
      </div>}
      <div className="row mt-3">
        <div className="col">
          <CategoryTreeMap sortedCategoryExpenses={props.sortedCategoryExpenses} />
        </div>
      </div>
    </>
  )
};

CategoryExpenses.propTypes = {
  handleCategoryChange: PropTypes.func.isRequired,
  filterCategories: PropTypes.instanceOf(Set).isRequired,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  sortedCategoryExpenses: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.shape({
      amount: PropTypes.number.isRequired,
      category: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
      }).isRequired,
      transactions: PropTypes.arrayOf(PropTypes.shape({
        amount: PropTypes.number.isRequired
      })).isRequired
    })
  })).isRequired
};

export default CategoryExpenses;
