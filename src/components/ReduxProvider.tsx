'use client';

import React from 'react';
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

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <div>
          <Menu persistor={persistor} />
          <div className="container mt-4">
            {children}
          </div>
          <Footer />
        </div>
      </PersistGate>
    </Provider>
  );
}