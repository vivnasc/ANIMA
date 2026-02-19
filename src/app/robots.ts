import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/chat/', '/settings', '/mirrors', '/api/'],
      },
    ],
    sitemap: 'https://animamirror.com/sitemap.xml',
  }
}
