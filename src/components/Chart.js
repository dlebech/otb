import React from 'react';
import { connect } from 'react-redux';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';

const Chart = props => {
  if (props.transactions.data.length === 0) return null;

  const data = props.transactions.data
    .slice(props.transactions.skipRows)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(transaction => {
      return {
        date: transaction[0], // TODO
        total: transaction[3] // TODO
      }
    });

  return (
    <div className="row justify-content-center">
      <div className="col-6 chart">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" />
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