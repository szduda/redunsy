import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { rejectBrowserOriginMiddleware } from './common/origin.middleware'
import { requestIdMiddleware } from './common/request-id.middleware'
import { BODY_SIZE_LIMIT } from './config/security'
import { setupOpenApi, validationPipe } from './openapi/setup-openapi'

export const createDunsyApp = async (): Promise<NestExpressApplication> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    bodyParser: true,
    logger: process.env.NODE_ENV === 'test' ? false : undefined,
  })

  app.useBodyParser('json', { limit: BODY_SIZE_LIMIT })
  app.useBodyParser('urlencoded', { limit: BODY_SIZE_LIMIT, extended: false })
  app.use(helmet({ contentSecurityPolicy: false, xPoweredBy: false }))
  app.use(requestIdMiddleware)
  app.use(rejectBrowserOriginMiddleware)
  app.useGlobalPipes(validationPipe())
  app.disable('x-powered-by')

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    setupOpenApi(app)
  }

  return app
}
