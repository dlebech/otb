import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../../types/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../../actions';
import ConfirmModal from '../shared/ConfirmModal';
import CurrencySelect from '../shared/CurrencySelect';
import ConfirmDelete from './ConfirmDelete';
import type { RootState } from '../../reducers';

const NEW_ACCOUNT_NAME = 'New Account';

interface AccountType {
  id: string;
  name: string;
  currency?: string;
}

interface Transaction {
  id: string;
  account?: string;
}

interface AccountEditProps {
  textRef: React.RefObject<HTMLInputElement | null>;
  accountName: string;
  accountCurrency?: string;
  handleSave: () => void;
  handleCancel: () => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCurrencyChange: (currency: string) => void;
}

function AccountEdit({
  textRef,
  accountName,
  accountCurrency,
  handleSave,
  handleCancel,
  handleNameChange,
  handleCurrencyChange
}: AccountEditProps) {
  return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      handleSave();
    }}>
      <div className="form-group">
        <input
          ref={textRef}
          type="text"
          className="form-control form-control-sm"
          placeholder="Name of account"
          value={accountName}
          onChange={handleNameChange}
          onKeyDown={e => e.keyCode === 27 && handleCancel()}
        />
      </div>
      <div className="form-group">
        <CurrencySelect
          onChange={handleCurrencyChange}
          selectedCurrency={accountCurrency}
        />
      </div>
      <button type="submit" className="btn btn-success btn-sm mx-2">
        Save
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </form>
  );
}

interface AccountProps {
  account: AccountType;
  transactions: Transaction[];
  handleUpdateAccount: (accountId: string, name: string, currency?: string) => void;
  onDeleteRequest: (account: AccountType) => void;
}

function Account({
  account,
  transactions,
  handleUpdateAccount,
  onDeleteRequest
}: AccountProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<string | undefined>('');
  const textRef = useRef<HTMLInputElement>(null);

  const handleEditAccount = useCallback(() => {
    setEditing(true);
    setName(account.name);
    setCurrency(account.currency);
    setTimeout(() => textRef.current?.focus(), 0);
  }, [account.name, account.currency]);

  useEffect(() => {
    // This is the easy way to make sure a new account is in edit mode.
    if (account.name === NEW_ACCOUNT_NAME) {
      handleEditAccount();
    }
  }, [account.name, handleEditAccount]);

  const handleSave = () => {
    handleUpdateAccount(account.id, name, currency);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleCurrencyChange = (currency: string) => {
    setCurrency(currency);
  };

  const handleDeleteConfirm = () => {
    onDeleteRequest(account);
  };

  if (editing) {
    return <AccountEdit
      textRef={textRef}
      accountName={name}
      accountCurrency={currency}
      handleSave={handleSave}
      handleCancel={handleCancel}
      handleNameChange={handleNameChange}
      handleCurrencyChange={handleCurrencyChange}
    />
  }

  return (
    <section>
      <span
        className="cursor-pointer"
        onClick={handleEditAccount}
        data-tip={`ID: ${account.id}`}
      >
        {account.name} ({account.currency || 'No currency specified'})
        <FontAwesomeIcon
          icon="edit"
          className="ms-2"
        />
      </span>
      <FontAwesomeIcon
        icon="trash-alt"
        className="ms-2 cursor-pointer"
        onClick={handleDeleteConfirm}
      />
    </section>
  );
}

export default function Accounts() {
  const accounts = useSelector((state: RootState) => state.accounts.data);
  const transactions = useSelector((state: RootState) => state.transactions.data);
  const dispatch = useDispatch<AppDispatch>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AccountType | null>(null);

  const handleUpdateAccount = (accountId: string, name: string, currency?: string) => {
    dispatch(actions.updateAccount(accountId, name, currency));
  };

  const handleAddAccount = (name: string, currency?: string) => {
    dispatch(actions.addAccount(name, currency));
  };

  const handleDeleteAccount = (accountId: string) => {
    dispatch(actions.deleteAccount(accountId));
    setShowConfirmModal(false);
    setAccountToDelete(null);
  };

  const handleDeleteRequest = (account: AccountType) => {
    setAccountToDelete(account);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (accountToDelete) {
      handleDeleteAccount(accountToDelete.id);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <ul>
            {accounts.map(a => {
              return (
                <li key={`account-${a.id}`}>
                  <Account
                    account={a}
                    transactions={transactions}
                    handleUpdateAccount={handleUpdateAccount}
                    onDeleteRequest={handleDeleteRequest}
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
            onClick={() => handleAddAccount(NEW_ACCOUNT_NAME, undefined)}
          >
            <FontAwesomeIcon
              icon="plus"
              className="me-1"
              fixedWidth
            />
            Add New Account
          </button>
        </div>
      </div>
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        body={
          accountToDelete ? (
            <ConfirmDelete
              nameToDelete={accountToDelete.name}
              numTransactions={transactions.filter(t => t.account === accountToDelete.id).length}
            />
          ) : null
        }
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />
    </>
  );
}
