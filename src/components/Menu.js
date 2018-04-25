import React from 'react';
import { Link } from 'react-router-dom';

const Menu = props => {
  // Do not return the menu on the front page.
  if (props.match.url === '/') return null;

  const active = url => {
    return props.match.url === url ? ' active' : '';
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Off The Books</Link>
        <div className="navbar-collapse">
          <ul className="navbar-nav">
            <li className={`nav-item${active('/upload')}`}>
              <Link className="nav-link" to="/upload">Upload</Link>
            </li>
            <li className={`nav-item${active('/chart')}`}>
              <Link className="nav-link" to="/chart">Charts</Link>
            </li>
            <li className={`nav-item${active('/transaction')}`}>
              <Link className="nav-link" to="/transaction">Transactions</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
