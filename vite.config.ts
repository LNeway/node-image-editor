import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: false, // 禁用 React Fast Refresh 避免开发环境报错
    }),
    glsl(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
