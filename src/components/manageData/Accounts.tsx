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

// Track account IDs created in this session so we only auto-open the edit
// form for genuinely new accounts, not ones rehydrated from persisted state.
const newAccountIds = new Set<string>();

interface AccountType {
  id: string;
  name: string;
  currency?: string;
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
      <div className="mb-6">
        <input
          ref={textRef}
          type="text"
          className="block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Name of account"
          value={accountName}
          onChange={handleNameChange}
          onKeyDown={e => e.keyCode === 27 && handleCancel()}
        />
      </div>
      <div className="mb-6">
        <CurrencySelect
          onChange={handleCurrencyChange}
          selectedCurrency={accountCurrency}
        />
      </div>
      <button type="submit" className="inline-flex items-center justify-center rounded font-medium transition-colors bg-green-600 text-white hover:bg-green-700 px-3 py-1 text-sm mx-2">
        Save
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded font-medium transition-colors bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-sm"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </form>
  );
}

interface AccountProps {
  account: AccountType;
  handleUpdateAccount: (accountId: string, name: string, currency?: string) => void;
  onDeleteRequest: (account: AccountType) => void;
}

function Account({
  account,
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
    if (account.name === NEW_ACCOUNT_NAME && newAccountIds.has(account.id)) {
      newAccountIds.delete(account.id);
      handleEditAccount(); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [account.id, account.name, handleEditAccount]);

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
          className="ml-2"
        />
      </span>
      <FontAwesomeIcon
        icon="trash-alt"
        className="ml-2 cursor-pointer"
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
  const prevAccountIds = useRef(new Set(accounts.map(a => a.id)));

  useEffect(() => {
    const prevIds = prevAccountIds.current;
    const currentIds = new Set(accounts.map(a => a.id));
    accounts.forEach(a => {
      if (!prevIds.has(a.id)) {
        newAccountIds.add(a.id);
      }
    });
    prevAccountIds.current = currentIds;
  }, [accounts]);

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
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <ul>
            {accounts.map(a => {
              return (
                <li key={`account-${a.id}`}>
                  <Account
                    account={a}
                    handleUpdateAccount={handleUpdateAccount}
                    onDeleteRequest={handleDeleteRequest}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 mt-4">
        <div className="flex-1">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm"
            onClick={() => handleAddAccount(NEW_ACCOUNT_NAME, undefined)}
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
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
      />
    </>
  );
}
