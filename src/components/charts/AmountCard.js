import React from 'react';
import PropTypes from 'prop-types';

const AmountCard = props => {
  return (
    <div className="card">
      <div className="card-body">
        <p className="display-3">{props.value}</p>
        <h5 className="card-title">{props.title}</h5>
      </div>
    </div>
  )
};

AmountCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

export default AmountCard;
