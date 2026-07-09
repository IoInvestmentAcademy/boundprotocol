import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_PORT = 5239

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __SIM_BUILD_ID__: JSON.stringify(`v7-${Date.now().toString(36)}`),
    __DEV_PORT__: JSON.stringify(DEV_PORT),
  },
  server: {
    port: DEV_PORT,
    strictPort: true,
    host: '127.0.0.1',
    open: false,
  },
  preview: {
    port: DEV_PORT,
    strictPort: true,
    host: '127.0.0.1',
  },
})
