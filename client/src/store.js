import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import reducers from './reducers';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['helpButton'],
};

const persistedReducers = persistReducer(persistConfig, reducers);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = composeEnhancers(applyMiddleware(reduxThunk));
const store = createStore(persistedReducers, middleware);
const persistor = persistStore(store);

export { store, persistor };
