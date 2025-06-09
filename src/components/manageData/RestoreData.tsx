import React, { useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { type AppDispatch } from '../../types/redux';
import * as actions from '../../actions';
import { toggleLocalStorage as utilToggleLocalStorage } from '../../util';

interface RestoreDataProps {
  children: React.ReactNode;
  className: string;
  persistor: any;
}

export default function RestoreData({ children, className, persistor }: RestoreDataProps) {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (fe) => {
      if (!fe.target?.result) return;
      
      const newState = JSON.parse(fe.target.result as string);
      dispatch(actions.restoreStateFromFile(newState));

      // Toggle local storage depending on the storage setting for the newly
      // imported file.
      const localStorageEnabled = newState.app?.storage?.localStorage;
      utilToggleLocalStorage(persistor, localStorageEnabled);
    };

    reader.readAsText(file, 'utf-8');
  }, [dispatch, persistor]);

  const handleRestoreClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleRestoreFile}
      />
      <div
        className={className}
        onClick={handleRestoreClick}
      >
        {children}
      </div>
    </>
  );
}
