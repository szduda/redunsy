import { Controller, Get, ServiceUnavailableException } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'

import { pingDatabase } from './database-ping'

@ApiTags('ready')
@ApiSecurity('internal-key')
@Controller()
export class ReadyController {
  @Get('ready')
  @ApiOperation({ summary: 'Readiness. Requires internal key. Pings Postgres when configured.' })
  @ApiOkResponse({
    schema: { example: { status: 'ok', database: 'unconfigured' } },
  })
  async readiness() {
    const database = await pingDatabase()
    if (database === 'error') {
      throw new ServiceUnavailableException('Database ping failed')
    }
    return { status: 'ok', database }
  }
}
