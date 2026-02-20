import { Middleware } from '@reduxjs/toolkit';
import { pushHistory } from '../historySlice';

// Define state types inline to avoid circular dependency
interface GraphState {
  nodes: any[];
  edges: any[];
}

interface UIState {
  selectedNodeId: string | null;
}

interface HistoryState {
  past: any[];
  future: any[];
}

interface ProjectState {
  currentProject: any;
}

interface SettingsState {
  previewResolution: string;
  language: string;
  theme: string;
}

interface RootState {
  graph: GraphState;
  ui: UIState;
  history: HistoryState;
  project: ProjectState;
  settings: SettingsState;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAction = any;

export const historyMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action: AnyAction) => {
    const result = next(action);

    // Track graph changes for history
    if (
      action.type === 'graph/addNode' ||
      action.type === 'graph/removeNode' ||
      action.type === 'graph/updateNode' ||
      action.type === 'graph/addEdge' ||
      action.type === 'graph/removeEdge'
    ) {
      const state = store.getState();
      const graph = state.graph;

      store.dispatch(
        pushHistory({
          description: `Action: ${action.type}`,
          graphSnapshot: {
            nodes: graph.nodes,
            edges: graph.edges,
          },
        })
      );
    }

    return result;
  };
