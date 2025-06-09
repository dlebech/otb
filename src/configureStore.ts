import { configureStore as createStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer, Persistor } from 'redux-persist';
import { reduxSearch, SearchApi } from 'redux-search';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers'

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

export default function configureStore(preloadedState: any = {}) {
  const store = createStore({
    reducer: persistedReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
          // Ignore these field paths in the state - they are now arrays, not Sets
          ignoredPaths: ['edit.transactionList.filterCategories', 'edit.charts.filterCategories']
        }
      }).concat(
        process.env.NODE_ENV === 'development' ? [createLogger()] : []
      ),
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers().concat([
        reduxSearch({
          resourceIndexes: {
            transactions: ['description', 'descriptionCleand']
          },
          resourceSelector: (resourceName: string, state: any) => {
            if (resourceName === 'transactions') {
              return state.transactions.data;
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

  if ((module as any).hot) {
    (module as any).hot.accept(() => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(
        persistReducer(persistConfig, nextRootReducer)
      );
    });
  }

  return { store, persistor };
}
