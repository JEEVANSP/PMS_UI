import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import uiReducer from "./ui/uiSlice";
import prescriptionReducer from "./prescription/prescriptionSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const authPersistConfig = { key: "auth", storage, whitelist: ["user", "accessToken"] };
const uiPersistConfig = { key: "ui", storage };

const persistedAuth = persistReducer(authPersistConfig, authReducer);
const persistedUi = persistReducer(uiPersistConfig, uiReducer);

export const rootReducer = combineReducers({
  auth: persistedAuth,
  ui: persistedUi,
  prescriptions: prescriptionReducer,
});