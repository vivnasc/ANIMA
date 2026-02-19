import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ANIMA — Jornada de Autoconhecimento',
    short_name: 'ANIMA',
    description: 'Autoconhecimento estruturado com 4 espelhos de IA.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ddd8cf',
    theme_color: '#9a7b50',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
