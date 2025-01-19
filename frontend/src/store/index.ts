import { configureStore } from "@reduxjs/toolkit";
import breachReducer from "./breachSlice";
import tagReducer from './tagSlice';

export const store = configureStore({
  reducer: {
    breach: breachReducer,
    tags: tagReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
