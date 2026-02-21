import path from 'path'
import { fileURLToPath } from 'url'

/** @type {import('next').NextConfig} */
let supabaseHost = 'hfrznvvpuyrzvypekqns.supabase.co'
try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (u) supabaseHost = new URL(u).hostname
} catch (_) {}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `img-src 'self' data: https://${supabaseHost} https://vercel.com`,
      "font-src 'self' https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // unsafe-inline + unsafe-eval are needed for Next.js RSC and Radix UI
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://js.paystack.co",
      `connect-src 'self' https://${supabaseHost} https://api.openai.com https://api.paystack.co wss://${supabaseHost}`,
      "frame-src https://js.paystack.co",
      "worker-src 'self' blob:",
    ].join('; '),
  },
]

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: ['jspdf', 'canvg'],
  turbopack: { root: path.resolve(__dirname) },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
