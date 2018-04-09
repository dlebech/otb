import React from 'react';
import { connect } from 'react-redux';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { nest } from 'd3-collection';
import { sum } from 'd3-array';

const Chart = props => {
  if (props.transactions.data.length === 0) return null;

  let data = props.transactions.data
    .sort((a, b) => a.date.localeCompare(b.date));
  data = nest()
    .key(d => d.date)
    .rollup(a => sum(a, d => d.amount))
    .entries(data);

  return (
    <div className="row justify-content-center">
      <div className="col-6 chart">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="key" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" />
          </LineChart>
        </ResponsiveContainer>
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