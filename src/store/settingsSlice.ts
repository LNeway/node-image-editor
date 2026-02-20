import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  previewResolution: '720' | '1080' | '2K';
  language: 'en' | 'zh';
  theme: 'dark' | 'light';
}

const initialState: SettingsState = {
  previewResolution: '1080',
  language: 'zh',
  theme: 'dark',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPreviewResolution: (state, action: PayloadAction<'720' | '1080' | '2K'>) => {
      state.previewResolution = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'zh'>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
  },
});

export const { setPreviewResolution, setLanguage, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
