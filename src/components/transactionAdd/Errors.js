import React from 'react';
import PropTypes from 'prop-types';

const Errors = props => {
  if (!Array.isArray(props.errors) || props.errors.length === 0) return null;
  return (
    <div className="row">
      <div className="col">
        <div className="alert alert-danger" role="alert">
          <ul className="my-0">
            {props.errors.map((e, i) => {
              return <li key={`error-message-${i}-${e.message}`}>{e.message}</li>
            })}
          </ul>
        </div>
      </div>
    </div>
  )
};

Errors.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string
  }))
};

Errors.defaultProps = {
  errors: []
};

export default Errors;