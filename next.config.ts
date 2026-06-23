import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Keep Node.js-only packages out of the Turbopack bundle.
   * @cursor/sdk and its connectrpc transports use Node.js-specific APIs
   * and native dynamic imports that Turbopack can't process.
   * Marking them as external means Next.js requires them at runtime instead.
   */
  /**
   * All server-side-only packages that rely on native Node.js TLS/networking
   * must be excluded from the Turbopack bundle so they run as plain Node.js
   * require() calls. Bundling them breaks native TLS certificate handling
   * (e.g. pg's ssl rejectUnauthorized option stops working).
   */
  serverExternalPackages: [
    // Cursor SDK — native connectrpc transports + dynamic imports
    '@cursor/sdk',
    '@connectrpc/connect-node',
    '@connectrpc/connect-web',
    // Chat SDK + adapters — pg TLS handling must stay native
    'chat',
    '@chat-adapter/slack',
    '@chat-adapter/state-pg',
    'pg',
    'pg-pool',
    'pg-connection-string',
    // Slack Web API client
    '@slack/web-api',
    '@slack/socket-mode',
  ],
}

export default nextConfig
