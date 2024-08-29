import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import baseConfig from './vite.config.base.js';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'replace-mainjs',
      transformIndexHtml(html) {
        return html.replace(/\/src\/main.jsx/g, '/reactsrc/main.jsx');
      },
    },
  ],
});
