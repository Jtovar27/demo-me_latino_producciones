import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meproducciones.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '',                      priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about',                priority: 0.7, changeFrequency: 'monthly' },
    { path: '/experiences',          priority: 0.8, changeFrequency: 'weekly' },
    { path: '/events',               priority: 0.9, changeFrequency: 'weekly' },
    { path: '/the-real-happiness',   priority: 0.95, changeFrequency: 'weekly' },
    { path: '/speakers',             priority: 0.7, changeFrequency: 'weekly' },
    { path: '/gallery',              priority: 0.5, changeFrequency: 'monthly' },
    { path: '/sponsors',             priority: 0.7, changeFrequency: 'weekly' },
    { path: '/contact',              priority: 0.6, changeFrequency: 'monthly' },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
