import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Pick the build target. `--mode consumer|partner` loads .env.consumer/.env.partner
  // which set VITE_APP. Defaults to the consumer app.
  const env = loadEnv(mode, process.cwd(), '')
  const app = env.VITE_APP === 'partner' ? 'partner' : 'consumer'

  return {
    logLevel: 'error', // Suppress warnings, only show errors
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true, // bind 0.0.0.0 so the Capacitor app (via `adb reverse`/LAN) can load the dev site
      port: app === 'partner' ? 5174 : 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    // Each app builds to its own folder so the two can be deployed (and later
    // wrapped in their own Capacitor shell) independently.
    build: {
      outDir: `dist/${app}`,
      emptyOutDir: true,
    },
  }
})
