import React from 'react';
import { Link } from 'react-router-dom';
import { version } from '../../package.json';
import { contactEmail } from '../config';

const Footer = () => {
  return (
    <>
      <hr />
      <div className="container">
        <div className="row justify-content-center my-3">
          <div className="col-auto text-center">
            <p>
              <Link to="/privacy">Privacy Policy</Link> / <a href="https://github.com/dlebech/otb">Source Code</a>{contactEmail ? ` / ${contactEmail}` : ''}<br />
              Current version: { version }
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;