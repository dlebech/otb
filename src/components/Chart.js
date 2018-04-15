import React from 'react';
import { connect } from 'react-redux';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Treemap,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';

// Bootstrap colors
// TODO: Should probably find a better way to store these.
const colors = {
  dark: '#343a40',
  white: '#ffffff'
};

const AmountPerDay = props => {
  const data = nest()
    .key(d => d.date)
    .rollup(a => sum(a, d => d.amount))
    .entries(props.transactions.data)
    .sort((a, b) => a.key.localeCompare(b.key))

  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <XAxis dataKey="key" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors.dark}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const AmountPerCategory = props => {
  const data = nest()
    .key(d => d.description)
    .rollup(a => Math.abs(sum(a, d => d.amount)))
    .entries(props.transactions.data)
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer>
      <Treemap
        data={data}
        nameKey="key"
        dataKey="value"
        stroke={colors.white}
        fill={colors.dark}
      >
        <Tooltip />
      </Treemap>
    </ResponsiveContainer>
  )
};

const Chart = props => {
  if (props.transactions.data.length === 0) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-6 chart">
        <AmountPerDay {...props} />
      </div>
      <div className="col-6 chart">
        <AmountPerCategory {...props} />
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    transactions: state.transactions
  };
};

export default connect(mapStateToProps)(Chart);