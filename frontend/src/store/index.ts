import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import topologyReducer from './slices/topologySlice';
import simulationReducer from './slices/simulationSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    topology: topologyReducer,
    simulation: simulationReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
