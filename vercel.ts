import { type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  devCommand: 'npm run dev',
  installCommand: 'npm install',
  alias: 're.dunsy.app',
}
