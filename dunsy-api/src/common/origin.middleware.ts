import type { NextFunction, Request, Response } from 'express'

import { headerValue, isForbiddenBrowserOrigin } from '../config/security'

import { errorEnvelope } from './error-envelope'

export const rejectBrowserOriginMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = headerValue(req.headers.origin)
  if (!origin) {
    next()
    return
  }
  if (!isForbiddenBrowserOrigin(origin)) {
    next()
    return
  }
  const requestId = req.requestId ?? 'unknown'
  res
    .status(403)
    .json(
      errorEnvelope(
        'BROWSER_ORIGIN_FORBIDDEN',
        'Browser origins must not call this API. Use the Next.js BFF.',
        requestId,
      ),
    )
}
