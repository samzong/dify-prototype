import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(root, 'dify-source/web/public'),
  resolve: {
    alias: [
      {
        find: /^@langgenius\/dify-ui\/styles\.css$/,
        replacement: path.resolve(root, 'packages/dify-ui/src/styles/styles.css'),
      },
      {
        find: /^@langgenius\/dify-ui\/cn$/,
        replacement: path.resolve(root, 'packages/dify-ui/src/cn.ts'),
      },
      {
        find: /^@langgenius\/dify-ui\/([^/]+)$/,
        replacement: path.resolve(root, 'packages/dify-ui/src/$1/index.tsx'),
      },
      {
        find: /^@dify\/iconify-collections\/custom-public$/,
        replacement: path.resolve(root, 'packages/iconify-collections/custom-public/index.mjs'),
      },
      {
        find: /^@dify\/iconify-collections\/custom-vender$/,
        replacement: path.resolve(root, 'packages/iconify-collections/custom-vender/index.mjs'),
      },
    ],
  },
  server: {
    port: 5173,
  },
})
