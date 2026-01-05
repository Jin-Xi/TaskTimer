
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Fix: Switched from 'vite' to 'vitest/config' and removed the problematic triple-slash reference 
// to ensure the 'test' property is correctly typed without environment conflicts.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
