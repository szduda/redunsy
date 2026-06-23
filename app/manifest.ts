import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Redunsy',
  short_name: 'Redunsy',
  description: 'Groovy player on re.dunsy.app',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'any',
  lang: 'en',
  background_color: '#ffffff',
  theme_color: '#f9c926',
  icons: [
    {
      src: '/favicons/fav-48.png',
      sizes: '48x48',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/favicons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/favicons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
  ],
})

export default manifest
