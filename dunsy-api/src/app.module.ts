import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'

import { InternalKeyGuard } from './auth/internal-key.guard'
import { ApiExceptionFilter } from './common/api-exception.filter'
import { RequestLogInterceptor } from './common/request-log.interceptor'
import { ConnectionModule } from './connection/connection.module'
import { HealthModule } from './health/health.module'
import { ReadyModule } from './ready/ready.module'

@Module({
  imports: [HealthModule, ReadyModule, ConnectionModule],
  providers: [
    { provide: APP_GUARD, useClass: InternalKeyGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLogInterceptor },
  ],
})
export class AppModule {}
