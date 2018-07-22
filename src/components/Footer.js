import React from 'react';
import { Link } from 'react-router-dom';

const Footer = props => {
  return (
    <React.Fragment>
      <hr />
      <div className="container">
        <div className="row justify-content-center my-3">
          <div className="col-auto">
            <Link to="/privacy">Privacy Policy</Link> / <a href="https://github.com/dlebech/off-the-books">Source Code</a>
          </div>
          <div className="col-auto">
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Footer;