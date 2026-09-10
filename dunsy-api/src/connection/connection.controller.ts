import { Controller, Get, Req } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'

import { EMAIL_HEADER, GOOGLE_SUB_HEADER, headerValue, isAdminEmail } from '../config/security'

import { WhoamiResponse } from './whoami.response'

@ApiTags('connection')
@ApiSecurity('internal-key')
@Controller('v1/connection')
export class ConnectionController {
  @Get('whoami')
  @ApiOperation({
    summary: 'Echo BFF-forwarded identity. Requires x-dunsy-internal-key (or Bearer).',
  })
  @ApiOkResponse({ type: WhoamiResponse })
  whoami(@Req() request: Request): WhoamiResponse {
    const googleSub = headerValue(request.headers[GOOGLE_SUB_HEADER]) || null
    const email = headerValue(request.headers[EMAIL_HEADER]) || null
    return {
      googleSub,
      email,
      admin: isAdminEmail(email, process.env.ADMIN_EMAILS),
    }
  }
}
