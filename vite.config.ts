import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Brotli 압축 (.br 파일 생성)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // 1KB 이상 파일만 압축
      deleteOriginFile: false, // 원본 파일 유지
    }),
    // Gzip 압축 (.gz 파일 생성) - 구형 브라우저 대비
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Needed for potential remote access/mobile testing
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supercluster': ['supercluster'],
          'kakao-maps': ['react-kakao-maps-sdk'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // 1MB로 경고 임계값 상향
  },
});
