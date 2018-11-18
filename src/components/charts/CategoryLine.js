import React from 'react';
import PropTypes from 'prop-types';
import { schemeCategory10 } from 'd3-scale-chromatic';
import CustomLineChart from '../shared/CustomLineChart';

const CategoryLine = props => {
  const largestCategories = [...props.sortedCategoryExpenses];

  const dateKeySelector = props.endDate.diff(props.startDate, 'month', true) < 2 ?
    t => t.date :
    t => t.date.substring(0, 7)

  // Find all dates from the top categories
  // Make a category -> date -> amount mapping from the categories
  const obj = {};
  largestCategories.forEach(c => {
    c.value.transactions.forEach(t => {
      const date = dateKeySelector(t);
      const categoryId = c.value.category.id
      // defaultdict would be nice here :-)
      if (!obj[date]) obj[date] = {};
      if (!obj[date][categoryId]) obj[date][categoryId] = 0;
      obj[date][categoryId] += Math.abs(t.amount);
    });
  });

  // Transform the mapping into a flat format that recharts understands.
  const allCategories = new Set(largestCategories.map(c => c.value.category.id));
  const data = Object.entries(obj)
    .map(([date, categories]) => {
      const categoryIds = new Set(Object.keys(categories));
      const missingCategories = [...allCategories]
        .filter(c => !categoryIds.has(c))
        .reduce((o, c) => {
          o[c] = 0;
          return o;
        }, {});

      return {
        key: date,
        ...categories,
        ...missingCategories
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  const series = largestCategories
    .map((c, i) => {
      return {
        dataKey: c.value.category.id,
        name: c.value.category.name,
        fill: schemeCategory10[i],
        stroke: schemeCategory10[i]
      }
    });

  const categoryIdKeys = series.map(s => s.dataKey).join();

  return (
    <CustomLineChart
      key={categoryIdKeys} // This recreates the component when categories change
      data={data}
      series={series}
      showLegend={true}
    />
  );
};

CategoryLine.propTypes = {
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
  })).isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired
};

export default CategoryLine;