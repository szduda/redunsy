import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { EMAIL_HEADER, GOOGLE_SUB_HEADER } from '../src/config/security'

import { startTestApp, withInternalKey } from './app.helper'

describe('GET /v1/connection/whoami', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await startTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects a missing internal key', async () => {
    const response = await request(app.getHttpServer()).get('/v1/connection/whoami')
    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('UNAUTHORIZED')
    expect(response.body.error.requestId).toBeTruthy()
  })

  it('rejects a wrong internal key', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/connection/whoami')
      .set('x-dunsy-internal-key', 'nope')
    expect(response.status).toBe(401)
  })

  it('echoes anonymous claims when the key is valid', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/connection/whoami')
      .set(withInternalKey())
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ googleSub: null, email: null, admin: false })
  })

  it('accepts Authorization Bearer as the internal key', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/connection/whoami')
      .set('Authorization', `Bearer ${process.env.DUNSY_API_INTERNAL_KEY}`)
    expect(response.status).toBe(200)
  })

  it('echoes forwarded identity and admin from ADMIN_EMAILS', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/connection/whoami')
      .set(
        withInternalKey({
          [GOOGLE_SUB_HEADER]: 'sub-1',
          [EMAIL_HEADER]: 'admin@dunsy.app',
        }),
      )
    expect(response.body).toEqual({
      googleSub: 'sub-1',
      email: 'admin@dunsy.app',
      admin: true,
    })
  })

  it('marks a non-allowlisted email as not admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/connection/whoami')
      .set(
        withInternalKey({
          [GOOGLE_SUB_HEADER]: 'sub-2',
          [EMAIL_HEADER]: 'user@example.com',
        }),
      )
    expect(response.body.admin).toBe(false)
  })
})
