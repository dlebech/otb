import { configureStore as createStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import { reduxSearch, SearchApi } from 'redux-search';
import storage from 'redux-persist/lib/storage';
import rootReducer, { type RootState } from './reducers'

export const persistConfig = {
  key: 'otb',
  storage: storage,
  whitelist: [
    'app',
    'accounts',
    'transactions',
    'categories'
  ]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

type PersistedState = RootState & { _persist: { version: number; rehydrated: boolean } };

export default function configureStore(preloadedState: Partial<RootState> = {}) {
  const store = createStore({
    reducer: persistedReducer,
    preloadedState: preloadedState as PersistedState,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/FLUSH', 'persist/PURGE'],
          // Ignore these field paths in the state - they are now arrays, not Sets
          ignoredPaths: ['edit.transactionList.filterCategories', 'edit.charts.filterCategories']
        }
      });
      if (process.env.NODE_ENV === 'development') {
        return middleware.concat(createLogger());
      }
      return middleware;
    },
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat([
        reduxSearch({
          resourceIndexes: {
            transactions: ['description', 'descriptionCleaned']
          },
          resourceSelector: (resourceName: string, state: unknown) => {
            const typedState = state as RootState;
            if (resourceName === 'transactions') {
              return typedState.transactions.data;
            }
            return [];
          },
          searchApi: new SearchApi({
            matchAnyToken: true
          })
        })
      ])
  });

  const persistor = persistStore(store);

  return { store, persistor };
}
