'use client';

import React, { createContext, useContext } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import dynamic from 'next/dynamic';
import configureStore from '../configureStore';
import configureFa from '../configureFa';
import Loading from './shared/Loading';

// Dynamic imports for components
const Menu = dynamic(() => import('./Menu'));
const Footer = dynamic(() => import('./Footer'));

// Configure FontAwesome and store
configureFa();
const { store, persistor } = configureStore({});

// Create persistor context
const PersistorContext = createContext<any>(null);

export const usePersistor = () => {
  const context = useContext(PersistorContext);
  if (!context) {
    throw new Error('usePersistor must be used within a ReduxProvider');
  }
  return context;
};

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <PersistorContext.Provider value={persistor}>
          <div>
            <Menu />
            <div className="container mx-auto px-4 mt-4">
              {children}
            </div>
            <Footer />
          </div>
        </PersistorContext.Provider>
      </PersistGate>
    </Provider>
  );
}