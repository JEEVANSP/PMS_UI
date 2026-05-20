import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "@auth/slices";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const authPersistConfig = { key: "auth", storage, whitelist: ["user", "accessToken"] };

const persistedAuth = persistReducer(authPersistConfig, authReducer);

export const rootReducer = combineReducers({
  auth: persistedAuth,
});
