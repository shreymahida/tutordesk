import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    'process.env.IS_PREACT': JSON.stringify('false'),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'TutorHQ — Business Manager',
        short_name: 'TutorHQ',
        description: 'Tutoring business management — students, sessions, payments, progress',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Always fetch fresh HTML from network so a new deploy is never blocked
        // by a stale cached page. Falls back to cache only when offline.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'html', networkTimeoutSeconds: 4 },
          },
        ],
        navigateFallbackDenylist: [/^\/parent\//, /^\/book\//, /^\/family\//, /^\/board\//],
      },
    }),
  ],
})
