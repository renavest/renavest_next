import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renavestapp.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/auth-check/',
          '/billing/',
          '/therapist/',
          '/employee/',
          '/employer/',
          '/admin/',
          '/_next/',
          '/.*\\?.*', // Disallow URLs with query parameters (for cleaner indexing)
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/auth-check/',
          '/billing/',
          '/therapist/',
          '/employee/',
          '/employer/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
