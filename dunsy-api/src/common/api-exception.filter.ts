import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

import { type ErrorCode, errorEnvelope } from './error-envelope'

const httpStatusToCode = (status: number): ErrorCode => {
  if (status === 401) return 'UNAUTHORIZED'
  if (status === 403) return 'BROWSER_ORIGIN_FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 413) return 'PAYLOAD_TOO_LARGE'
  if (status === 400 || status === 422) return 'VALIDATION_ERROR'
  if (status === 503) return 'DATABASE_UNAVAILABLE'
  return 'INTERNAL_ERROR'
}

const messageFromHttpException = (exception: HttpException): string => {
  const payload = exception.getResponse()
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: string | string[] }).message
    if (Array.isArray(message)) return message.join('; ')
    if (typeof message === 'string') return message
  }
  return exception.message
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const requestId = request.requestId ?? 'unknown'

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const code = httpStatusToCode(status)
      response
        .status(status)
        .json(errorEnvelope(code, messageFromHttpException(exception), requestId))
      return
    }

    this.logger.error(
      JSON.stringify({
        requestId,
        message: exception instanceof Error ? exception.message : 'Unknown error',
      }),
    )
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorEnvelope('INTERNAL_ERROR', 'An unexpected error occurred', requestId))
  }
}
