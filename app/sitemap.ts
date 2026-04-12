import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  return [
    '/',
    '/apply',
    '/apply/resume',
    '/apply/success',
    '/student/login',
    '/mentor-login',
    '/staff/login',
    '/pay',
    '/contact',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/apply' ? 0.9 : 0.7,
  }))
}
