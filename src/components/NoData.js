import React from 'react';
import { Link } from 'react-router-dom';

const NoData = () => {
  return (
    <div className="row">
      <div className="col">
        <p>No data yet. <Link to="/transactions/add">Add some</Link>.</p>
      </div>
    </div>
  );
};

export default NoData;