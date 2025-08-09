import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import iconsData from './public/icons.json';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'offline.html',
        ...iconsData.icons.map(icon => icon.src)
      ],
      manifest: {
        name: 'UCF Field',
        short_name: 'UCF',
        description: 'Kisaan + POS PWA',
        theme_color: '#1a73e8',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: iconsData.icons.map(icon => ({
          src: `/${icon.src}`,
          sizes: icon.sizes,
          type: 'image/png'
        }))
      }
    })
  ]
});
