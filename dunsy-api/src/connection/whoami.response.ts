import { ApiProperty } from '@nestjs/swagger'

export class WhoamiResponse {
  @ApiProperty({ type: String, nullable: true, example: 'google-oauth2|123' })
  googleSub!: string | null

  @ApiProperty({ type: String, nullable: true, example: 'user@example.com' })
  email!: string | null

  @ApiProperty({ type: Boolean, example: false })
  admin!: boolean
}
