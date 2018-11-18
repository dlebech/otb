import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
} from 'recharts';
import color from '../../data/color'
import { formatNumber } from '../../util';

const CategoryTreeMap = props => {
  const data = props.sortedCategoryExpenses
    .map(d => {
      return {
        key: d.value.category.name,
        value: d.value.amount
      };
    });

  return (
    <div className="chart">
      <ResponsiveContainer>
        <Treemap
          data={data}
          nameKey="key"
          dataKey="value"
          stroke={color.bootstrap.white}
          fill={color.bootstrap.dark}
        >
          <Tooltip
            formatter={val => formatNumber(val, { maximumFractionDigits: 0 })}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
};

CategoryTreeMap.propTypes = {
  sortedCategoryExpenses: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.shape({
      amount: PropTypes.number.isRequired,
      category: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
      }).isRequired
    })
  })).isRequired,
};

export default CategoryTreeMap;