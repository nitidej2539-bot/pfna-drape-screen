import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { demoCode } from './tools/demoCode.js';

const root = import.meta.dirname;

export default defineConfig({
  plugins: [react(), demoCode(root)],
  base: './',
  build: {
    chunkSizeWarningLimit: 1500, // Room3D (three.js) โหลดแยกภายหลัง
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'), // เวอร์ชันหลัก: 3D จริง (Three.js)
        flat: resolve(root, '2d.html'), // เวอร์ชันสำรอง: 2.5D (ภาพ mockup)
      },
    },
  },
});
