import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import { gameApi } from "./api/GameApi";
import { authApi } from "./api/AuthApi";
import { playerApi } from "./api/PlayerApi";
import playerReducer from "./reducers/PlayerReducer";


const persistConfig = {
  key: "root",
  storage,
  blacklist: [
    gameApi.reducerPath,
    authApi.reducerPath,
    playerApi.reducerPath
  ]
};

const rootReducer = combineReducers({
  [gameApi.reducerPath]: gameApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [playerApi.reducerPath]: playerApi.reducer,
  playerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      gameApi.middleware,
      authApi.middleware,
      playerApi.middleware,
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
