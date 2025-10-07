import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  source: {
    entry: {
      index: './src/index.tsx'
    },
  },
  resolve: {
    alias: {
      '@': './src',
    }
  },
  html: {
    title: 'MyApp Frontend'
  }
});
