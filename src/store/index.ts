import { configureStore, Middleware, AnyAction } from '@reduxjs/toolkit';
import graphReducer from './graphSlice';
import uiReducer from './uiSlice';
import historyReducer from './historySlice';
import projectReducer from './projectSlice';
import settingsReducer from './settingsSlice';
import { historyMiddleware } from './middleware/historyMiddleware';

// Define RootState inline
interface RootState {
  graph: ReturnType<typeof graphReducer>;
  ui: ReturnType<typeof uiReducer>;
  history: ReturnType<typeof historyReducer>;
  project: ReturnType<typeof projectReducer>;
  settings: ReturnType<typeof settingsReducer>;
}

const createMiddleware = (): Middleware<AnyAction, RootState> => {
  return historyMiddleware;
};

export const store = configureStore({
  reducer: {
    graph: graphReducer,
    ui: uiReducer,
    history: historyReducer,
    project: projectReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(createMiddleware()),
});

export type AppDispatch = typeof store.dispatch;
export type { RootState };
