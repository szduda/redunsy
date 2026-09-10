import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Liveness. No auth, no database.' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  liveness() {
    return { status: 'ok' }
  }
}
