import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, '../vuesrc/useDataFormObserve.js'),
      name: 'useDataFormObserve',
      fileName: 'useDataFormObserve',
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下,全局模式下为这些外部化的依赖提供一个全局变量
        // globals: {
        //   liteMove: 'useDataFormObserve',
        // },
        manualChunks: {
          'sanitize-html': ['sanitize-html'],
          dataObserve: [resolve(__dirname, '../src/utils/index.js')],
        },
      },
    },
  },
});
