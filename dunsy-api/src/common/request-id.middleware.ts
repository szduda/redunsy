import { randomUUID } from 'node:crypto'

import type { NextFunction, Request, Response } from 'express'

import { REQUEST_ID_HEADER, headerValue } from '../config/security'

export const resolveRequestId = (req: Request): string => {
  const fromDunsy = headerValue(req.headers[REQUEST_ID_HEADER])
  if (fromDunsy) return fromDunsy
  const fromGeneric = headerValue(req.headers['x-request-id'])
  if (fromGeneric) return fromGeneric
  return randomUUID()
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = resolveRequestId(req)
  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)
  next()
}
