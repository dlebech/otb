import React, { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../types/redux';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toggleLocalStorage, exitTestMode } from '../actions';
import { RootState } from '../reducers';
import Modal from './shared/Modal';
import { toggleLocalStorage as utilToggleLocalStorage } from '../util';
import { usePersistor } from './ReduxProvider';

export default function Menu() {
  const persistor = usePersistor();
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
    dispatch(exitTestMode());
    router.push('/');
  }, [localStorageEnabled, handleToggleStorage, dispatch, router]);

  useEffect(() => {
    // Initialize storage state only once on mount (emulating componentDidMount)
    if (persistor) {
      utilToggleLocalStorage(persistor, localStorageEnabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - run only once on mount

  // Do not return the menu on the front page.
  if (pathname === '/') return null;

  const active = (url: string): string => {
    return pathname.startsWith(url) ? ' active' : '';
  };

  return (
    <>
      <nav className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 flex items-center py-3">
          <Link className="text-xl font-bold text-white no-underline" href="/">OTB</Link>
          <div className="flex items-center ml-6 flex-1">
            <ul className="flex items-center gap-6 mr-auto">
              <li className={`${active('/transactions')}`}>
                <Link className="text-gray-300 hover:text-white transition-colors no-underline" href="/transactions">
                  <FontAwesomeIcon icon="table" className="mr-1" fixedWidth />
                  Transactions
                </Link>
              </li>
              <li className={`${active('/charts')}`}>
                <Link className="text-gray-300 hover:text-white transition-colors no-underline" href="/charts">
                  <FontAwesomeIcon icon="chart-bar" className="mr-1" fixedWidth />
                  Charts
                </Link>
              </li>
              <li className={`${active('/data')}`}>
                <Link className="text-gray-300 hover:text-white transition-colors no-underline" href="/data">
                  <FontAwesomeIcon icon="database" className="mr-1" fixedWidth />
                  Manage Data
                </Link>
              </li>
            </ul>
            {isTestMode && (
              <button
                onClick={handleExitDemo}
                className="inline-flex items-center justify-center rounded font-medium transition-colors border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white px-3 py-1 text-sm mx-4"
              >
                Exit Demo
              </button>
            )}
            <div className="flex items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="local-storage-check"
                  className="mr-2"
                  checked={localStorageEnabled}
                  onChange={handleToggleStorage}
                />
                <label className="text-sm text-gray-300" htmlFor="local-storage-check">
                  Save Data in Browser
                </label>
                <FontAwesomeIcon
                  icon="question-circle"
                  className="ml-1 cursor-pointer text-blue-400"
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
            If enabled, the data will be saved in the browser&apos;s local storage.
            The data will be available if you close and re-open the
            browser, but it will <em>not</em> be accessible by other
            websites.
          </p>
          <p>
            On a shared machine, this feature is not recommended. Download
            the data instead, and restore it later with the restore function.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700 px-4 py-2"
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
