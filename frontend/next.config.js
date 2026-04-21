/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure static assets are served correctly
  distDir: '.next',
  // Use 'standalone' output for better compatibility with hosting services
  output: 'standalone',
  // Fix for CSS modules and Tailwind
  experimental: {
    optimizeCss: true,
  },
  // Ignore TypeScript build errors for deployment (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint build errors for deployment (optional)
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig