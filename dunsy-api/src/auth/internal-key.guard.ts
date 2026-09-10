import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'

import { extractInternalKey, secretsEqual } from '../config/security'

const isPublicPath = (path: string): boolean => {
  if (path === '/health') return true
  if (process.env.NODE_ENV === 'production') return false
  return path === '/docs' || path.startsWith('/docs/') || path === '/docs-json'
}

@Injectable()
export class InternalKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    if (isPublicPath(request.path)) return true

    const expected = process.env.DUNSY_API_INTERNAL_KEY ?? ''
    const provided = extractInternalKey(request.headers)
    if (!secretsEqual(provided, expected)) {
      throw new UnauthorizedException('Invalid or missing internal key')
    }
    return true
  }
}
