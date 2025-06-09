import React, { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../types/redux';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toggleLocalStorage } from '../actions';
import { RootState } from '../reducers';
import Modal from './shared/Modal';
import { toggleLocalStorage as utilToggleLocalStorage } from '../util';

interface MenuProps {
  persistor?: any;
}

export default function Menu({ persistor }: MenuProps) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();
  const [showSaveDataModal, setShowSaveDataModal] = useState(false);
  
  const localStorageEnabled = useSelector((state: RootState) => state.app.storage.localStorage);
  const isTestMode = useSelector((state: RootState) => state.app.isTestMode);

  const handleShowSaveDataModal = useCallback(() => {
    setShowSaveDataModal(true);
  }, []);

  const handleToggleStorage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;

    await utilToggleLocalStorage(persistor, enabled);
    dispatch(toggleLocalStorage(enabled));
  }, [persistor, dispatch]);

  const handleExitDemo = useCallback(async () => {
    if (localStorageEnabled) {
      await handleToggleStorage({ target: { checked: false } } as React.ChangeEvent<HTMLInputElement>);
    }
    router.push('/');
  }, [localStorageEnabled, handleToggleStorage, router]);

  useEffect(() => {
    // Initialize storage state only once on mount
    if (persistor) {
      utilToggleLocalStorage(persistor, localStorageEnabled);
    }
  }); // Empty dependency array - run only once on mount

  // Do not return the menu on the front page.
  if (pathname === '/') return null;

  const active = (url: string): string => {
    return pathname.startsWith(url) ? ' active' : '';
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" href="/">OTB</Link>
          <div className="navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className={`nav-item${active('/transactions')}`}>
                <Link className="nav-link" href="/transactions">
                  <FontAwesomeIcon icon="table" className="me-1" fixedWidth />
                  Transactions
                </Link>
              </li>
              <li className={`nav-item${active('/charts')}`}>
                <Link className="nav-link" href="/charts">
                  <FontAwesomeIcon icon="chart-bar" className="me-1" fixedWidth />
                  Charts
                </Link>
              </li>
              <li className={`nav-item${active('/data')}`}>
                <Link className="nav-link" href="/data">
                  <FontAwesomeIcon icon="database" className="me-1" fixedWidth />
                  Manage Data
                </Link>
              </li>
            </ul>
            {isTestMode && (
              <button
                onClick={handleExitDemo}
                className="btn btn-outline-warning btn-sm mx-3"
              >
                Exit Demo
              </button>
            )}
            <div className="d-flex align-items-center">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="local-storage-check"
                  className="form-check-input"
                  checked={localStorageEnabled}
                  onChange={handleToggleStorage}
                />
                <label className="form-check-label navbar-text" htmlFor="local-storage-check">
                  Save Data in Browser
                </label>
                <FontAwesomeIcon
                  icon="question-circle"
                  className="ms-1 cursor-pointer text-info"
                  fixedWidth
                  onClick={handleShowSaveDataModal}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Modal
        show={showSaveDataModal}
        onHide={() => setShowSaveDataModal(false)}
        title="Saving data in the browser?"
        size="sm"
      >
        <div>
          <p>
            If enabled, the data will be saved in the browser's local storage.
            The data will be available if you close and re-open the
            browser, but it will <em>not</em> be accessible by other
            websites.
          </p>
          <p>
            On a shared machine, this feature is not recommended. Download
            the data instead, and restore it later with the restore function.
          </p>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSaveDataModal(false)}
            >
              Cool
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
