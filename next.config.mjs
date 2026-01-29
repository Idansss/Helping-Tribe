import path from 'path'
import { fileURLToPath } from 'url'

/** @type {import('next').NextConfig} */
let supabaseHost = 'hfrznvvpuyrzvypekqns.supabase.co'
try {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (u) supabaseHost = new URL(u).hostname
} catch (_) {}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
}

export default nextConfig
