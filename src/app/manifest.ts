import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Renavest - Financial Therapy for Workplace Wellness',
    short_name: 'Renavest',
    description:
      'Transform your workplace with financial therapy. Connect with certified financial therapists.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#9071FF',
    icons: [
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['business', 'healthcare', 'finance'],
    lang: 'en-US',
    orientation: 'portrait-primary',
  };
}
