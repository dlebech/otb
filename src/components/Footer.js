import React from 'react';
import { Link } from 'react-router-dom';
import { version } from '../../package.json';

const Footer = () => {
  return (
    <>
      <hr />
      <div className="container">
        <div className="row justify-content-center my-3">
          <div className="col-auto">
            <Link to="/privacy">Privacy Policy</Link> / <a href="https://github.com/dlebech/off-the-books">Source Code</a> / Version { version }
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;