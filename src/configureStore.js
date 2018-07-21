import { applyMiddleware, compose, createStore } from 'redux'
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import { reduxSearch } from 'redux-search';
import storage from 'redux-persist/lib/storage';
import rootReducer from './reducers'

const middlewares = [thunkMiddleware];
if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger());
}

const persistConfig = {
  key: 'otb',
  storage: storage,
  blacklist: ['edit', 'modal', 'search']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default function configureStore(preloadedState) {
  const enhancer = compose(
    applyMiddleware(...middlewares),
    reduxSearch({
      resourceIndexes: {
        transactions: ['description', 'descriptionCleand']
      },
      resourceSelector: (resourceName, state) => {
        if (resourceName === 'transactions') {
          return state.transactions.data;
        }
        return [];
      }
    })
  );

  const store = createStore(
    persistedReducer,
    preloadedState, 
    enhancer
  );

  const persistor = persistStore(store);

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(
        persistReducer(persistConfig, nextRootReducer)
      );
    });
  }

  return { store, persistor };
};
