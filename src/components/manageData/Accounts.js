import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { show, hide } from 'redux-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../../actions';
import Confirm from '../modals/Confirm';
import CurrencySelect from '../shared/CurrencySelect';
import ConfirmDelete from './ConfirmDelete';

const NEW_ACCOUNT_NAME = 'New Account';

const AccountEdit = props => {
  return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      props.handleSave();
    }}>
      <div className="form-group">
        <input
          ref={props.textRef}
          type="text"
          className="form-control form-control-sm"
          placeholder="Name of account"
          value={props.accountName}
          onChange={props.handleNameChange}
          onKeyDown={e => e.keyCode === 27 && props.handleCancel()}
        />
      </div>
      <div className="form-group">
        <CurrencySelect
          onChange={props.handleCurrencyChange}
          selectedCurrency={props.accountCurrency}
        />
      </div>
      <button type="submit" className="btn btn-success btn-sm mx-2">
        Save
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={props.handleCancel}
      >
        Cancel
      </button>
    </form>
  );
};

AccountEdit.propTypes = {
  accountName: PropTypes.string.isRequired,
  accountCurrency: PropTypes.string
};

class Account extends React.Component {
  constructor(props) {
    super(props);

    this.state = { editing: false };

    this.textRef = React.createRef();

    this.handleEditAccount = this.handleEditAccount.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
  }

  componentDidMount() {
    // This is the easy way to make sure a new account is in edit mode.
    // However, it might not be best practice.
    if (this.props.account.name === NEW_ACCOUNT_NAME) this.handleEditAccount();
  }

  handleEditAccount() {
    this.setState({
      editing: true,
      name: this.props.account.name,
      currency: this.props.account.currency
    }, () => this.textRef.current.focus());
  }

  handleSave() {
    this.props.handleUpdateAccount(
      this.props.account.id,
      this.state.name,
      this.state.currency
    );
    this.setState({ editing: false });
  }

  handleCancel() {
    this.setState({ editing: false });
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleCurrencyChange(currency) {
    this.setState({ currency });
  }

  async handleDelete() {
    await this.props.hideModal(Confirm.modalName);
    return this.props.handleDeleteAccount(this.props.account.id);
  }

  handleDeleteConfirm() {
    const numTransactions = this.props.transactions
      .filter(t => t.account === this.props.account.id)
      .length;
    this.props.showModal(Confirm.modalName, {
      handleYes: this.handleDelete,
      body: <ConfirmDelete
        nameToDelete={this.props.account.name}
        numTransactions={numTransactions}
      />
    });
  }

  render() {
    if (this.state.editing) {
      return <AccountEdit
        textRef={this.textRef}
        accountName={this.state.name}
        accountCurrency={this.state.currency}
        handleSave={this.handleSave}
        handleCancel={this.handleCancel}
        handleNameChange={this.handleNameChange}
        handleCurrencyChange={this.handleCurrencyChange}
      />
    }

    return (
      <section>
        <span
          className="cursor-pointer"
          onClick={this.handleEditAccount}
          data-tip={`ID: ${this.props.account.id}`}
        >
          {this.props.account.name} ({this.props.account.currency || 'No currency specified'})
          <FontAwesomeIcon
            icon="edit"
            className="ml-2"
          />
        </span>
        <FontAwesomeIcon
          icon="trash-alt"
          className="ml-2 cursor-pointer"
          onClick={this.handleDeleteConfirm}
        />
      </section>
    );
  }
}

Account.propTypes = {
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    currency: PropTypes.string
  }).isRequired,
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string
  })),
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  handleUpdateAccount: PropTypes.func.isRequired
};

const Accounts = props => {
  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <ul>
            {props.accounts.map(a => {
              return (
                <li key={`account-${a.id}`}>
                  <Account
                    account={a}
                    transactions={props.transactions}
                    handleUpdateAccount={props.handleUpdateAccount}
                    handleDeleteAccount={props.handleDeleteAccount}
                    showModal={props.showModal}
                    hideModal={props.hideModal}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => props.handleAddAccount(NEW_ACCOUNT_NAME, null)}
          >
            <FontAwesomeIcon
              icon="plus"
              className="mr-1"
              fixedWidth
            />
            Add New Account
          </button>
        </div>
      </div>
      <Confirm />
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    accounts: state.accounts.data,
    transactions: state.transactions.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleUpdateAccount: (accountId, name, currency) => {
      dispatch(actions.updateAccount(accountId, name, currency));
    },
    handleAddAccount: (name, currency) => {
      dispatch(actions.addAccount(name, currency));
    },
    handleDeleteAccount: accountId => {
      dispatch(actions.deleteAccount(accountId));
    },
    showModal: (...args) => {
      dispatch(show(...args));
    },
    hideModal: (...args) => {
      dispatch(hide(...args));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Accounts);
