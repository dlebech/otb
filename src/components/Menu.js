import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { show } from 'redux-modal';
import { toggleLocalStorage } from '../actions';
import SaveData from './modals/SaveData';
import { toggleLocalStorage as utilToggleLocalStorage } from '../util';

class Menu extends React.Component {
  constructor(props) {
    super(props);

    this.handleToggleStorage = this.handleToggleStorage.bind(this);
  }

  componentDidMount() {
    // When the component mounts, simulate a check change to ensure the proper
    // storage option is enabled/disabled.
    this.handleToggleStorage({
      target: {
        checked: this.props.localStorageEnabled
      }
    });
  }

  async handleToggleStorage(e) {
    const enabled = e.target.checked;

    await utilToggleLocalStorage(this.props.persistor, enabled);

    // Dispatch to redux
    this.props.toggleLocalStorage(enabled);
  }

  render() {
    // Do not return the menu on the front page.
    if (this.props.match.url === '/') return null;

    const active = url => {
      return this.props.match.url.startsWith(url) ? ' active' : '';
    }

    return (
      <>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">Off The Books</Link>
            <div className="navbar-collapse">
              <ul className="navbar-nav mr-auto">
                <li className={`nav-item${active('/transactions')}`}>
                  <Link className="nav-link" to="/transactions">
                    <FontAwesomeIcon icon="table" className="mr-1" fixedWidth />
                    Transactions
                  </Link>
                </li>
                <li className={`nav-item${active('/charts')}`}>
                  <Link className="nav-link" to="/charts">
                    <FontAwesomeIcon icon="chart-bar" className="mr-1" fixedWidth />
                    Charts
                  </Link>
                </li>
                <li className={`nav-item${active('/data')}`}>
                  <Link className="nav-link" to="/data">
                    <FontAwesomeIcon icon="database" className="mr-1" fixedWidth />
                    Manage Data
                  </Link>
                </li>
              </ul>
              <form className="form-inline">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="local-storage-check"
                    className="form-check-input"
                    checked={this.props.localStorageEnabled}
                    onChange={this.handleToggleStorage}
                  />
                  <label className="form-check-label navbar-text" htmlFor="local-storage-check">
                    Save Data in Browser
                  </label>
                </div>
              </form>
              <div className="navbar-text text-info">
                <FontAwesomeIcon
                  icon="question-circle"
                  className="ml-1 cursor-pointer"
                  fixedWidth
                  onClick={() => this.props.showModal(SaveData.modalName)}
                />
              </div>
            </div>
          </div>
        </nav>
        <SaveData />
      </>
    );
  }
};

const mapStateToProps = state => {
  return {
    localStorageEnabled: state.app.storage.localStorage
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleLocalStorage: enabled => {
      dispatch(toggleLocalStorage(enabled));
    },
    showModal: (...args) => {
      dispatch(show(...args));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
