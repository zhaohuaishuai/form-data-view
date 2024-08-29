import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import baseConfig from './vite.config.base.js';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'replace-mainjs',
      transformIndexHtml(html) {
        return html.replace(/\/src\/main.jsx/g, '/vuesrc/main.js');
      },
    },
  ],
});
