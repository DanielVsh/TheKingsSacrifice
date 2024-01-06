import {combineReducers, configureStore, Middleware, ThunkMiddleware} from "@reduxjs/toolkit";
import {persistReducer, persistStore} from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import {setupListeners} from "@reduxjs/toolkit/query";
import {gameApi} from "./api/GameApi.ts";
import playerReducer from "./reducers/PlayerReducer.ts";
import {playerApi} from "./api/PlayerApi.ts";

const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  [gameApi.reducerPath]: gameApi.reducer,
  [playerApi.reducerPath]: playerApi.reducer,
  playerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const middlewares: (Middleware | ThunkMiddleware)[] = [
  thunk,
  gameApi.middleware,
  playerApi.middleware,
];

export const store = configureStore({
  reducer: persistedReducer,
  middleware: middlewares,
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch