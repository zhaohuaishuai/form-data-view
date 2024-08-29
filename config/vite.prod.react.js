import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, '../reactsrc/useDataFormObserve.js'),
      name: 'useDataFormObserve',
      fileName: 'useDataFormObserve',
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react'],
      output: {
        // 在 UMD 构建模式下,全局模式下为这些外部化的依赖提供一个全局变量
        // globals: {
        //   liteMove: 'useDataFormObserve',
        // },
        // manualChunks: {
        //   'sanitize-html': ['sanitize-html'],
        // },
      },
    },
  },
});
