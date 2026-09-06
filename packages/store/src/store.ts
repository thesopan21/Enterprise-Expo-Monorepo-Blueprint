import { configureStore, type Reducer } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { AxiosInstance } from "axios";

import { createExampleApi } from "./api/exampleApi";

// Template store setup — a reference, not a fixed dependency. Replace
// `exampleApi` with your own createApi() slice(s); add each one's
// reducerPath/reducer to `reducer` below and its middleware to the chain
// (see README.md for the full walkthrough).
export function createAppStore(axiosInstance: AxiosInstance) {
  const exampleApi = createExampleApi(axiosInstance);

  const store = configureStore({
    reducer: {
      [exampleApi.reducerPath]: exampleApi.reducer as Reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(exampleApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

  setupListeners(store.dispatch);

  return { store, exampleApi };
}

export type AppStore = ReturnType<typeof createAppStore>["store"];
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
