import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Keep Node.js-only packages out of the Turbopack bundle.
   * @cursor/sdk and its connectrpc transports use Node.js-specific APIs
   * and native dynamic imports that Turbopack can't process.
   * Marking them as external means Next.js requires them at runtime instead.
   */
  serverExternalPackages: [
    '@cursor/sdk',
    '@connectrpc/connect-node',
    '@connectrpc/connect-web',
  ],
}

export default nextConfig
