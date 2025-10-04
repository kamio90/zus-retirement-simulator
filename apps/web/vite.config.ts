import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../../packages/core/src'),
      '@data': path.resolve(__dirname, '../../packages/data/src'),
      '@types': path.resolve(__dirname, '../../packages/types/src'),
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
