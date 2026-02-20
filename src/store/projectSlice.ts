import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectState {
  currentProject: ProjectInfo | null;
  projects: ProjectInfo[];
  isLoading: boolean;
}

const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  isLoading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<ProjectInfo | null>) => {
      state.currentProject = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectInfo>) => {
      state.projects.push(action.payload);
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    },
    setProjects: (state, action: PayloadAction<ProjectInfo[]>) => {
      state.projects = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCurrentProject, addProject, removeProject, setProjects, setLoading } =
  projectSlice.actions;
export default projectSlice.reducer;
