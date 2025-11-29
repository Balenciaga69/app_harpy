import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    open: true,
    port: 7414,
    host: '0.0.0.0',
    hmr: {
      port: 7414,
      host: 'localhost',
    },
  },
})
