import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleLocalStorage } from '../actions';

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

    // Pause/purge/resume the persistor, depending on the value.
    if (enabled) {
      await this.props.persistor.persist();
      await this.props.persistor.flush();
    } else {
      await this.props.persistor.pause();
      await this.props.persistor.flush();
      await this.props.persistor.purge();
    }

    // Dispatch to redux
    this.props.toggleLocalStorage(enabled);
  }

  render() {
    // Do not return the menu on the front page.
    if (this.props.match.url === '/') return null;

    const active = url => {
      return this.props.match.url === url ? ' active' : '';
    }

    return (
      <nav className="navbar navbar-expand-md navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Off The Books</Link>
          <div className="navbar-collapse">
            <ul className="navbar-nav mr-auto">
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
          </div>
        </div>
      </nav>
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
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
