import { configureStore } from "@reduxjs/toolkit";
import navigationBarReducer from "./navigationBarSlice";

export const store = configureStore({
  reducer: {
    navigationBar: navigationBarReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
