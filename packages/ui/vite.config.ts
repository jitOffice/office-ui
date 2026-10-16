import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  root: fileURLToPath(new URL('./demo', import.meta.url)),
  server: { port: 5173, strictPort: true },
})
