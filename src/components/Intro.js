import React from 'react';
import { Link } from 'react-router-dom';

const Intro = props => {
  return (
    <div className="jumbotron">
      <h1 className="display-4">Off The Books</h1>
      <p className="lead">Privacy-First Bank Transaction Analysis</p>
      <hr />
      <p>
        Catchy headline eh? But seriously, if you bave a list of bank transactions, and you want to see some pretty graphs, go ahead and upload the file here. It will never be stored anywhere.
      </p>
      <Link className="btn btn-dark btn-lg" to="/upload">Get Started</Link>
    </div>
  );
};

export default Intro;
