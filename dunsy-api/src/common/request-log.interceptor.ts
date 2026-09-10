import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import type { Request, Response } from 'express'
import { Observable, tap } from 'rxjs'

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLogInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()
    const started = Date.now()
    const requestId = request.requestId ?? 'unknown'
    const googleSub = request.headers['x-dunsy-google-sub']

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            requestId,
            method: request.method,
            path: request.path,
            status: response.statusCode,
            durationMs: Date.now() - started,
            userId: typeof googleSub === 'string' && googleSub ? googleSub : undefined,
          }),
        )
      }),
    )
  }
}
