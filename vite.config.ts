import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

dotenv.config();
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  test: {
    setupFiles: './setupTests.ts',
    globals: true,
    environment: 'jsdom'
  }
});
