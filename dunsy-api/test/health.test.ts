import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { startTestApp } from './app.helper'

describe('GET /health', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await startTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns ok without an internal key', async () => {
    const response = await request(app.getHttpServer()).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
    expect(response.headers['x-request-id']).toBeTruthy()
    expect(response.headers['x-powered-by']).toBeUndefined()
  })

  it('echoes x-dunsy-request-id', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('x-dunsy-request-id', 'req-123')
    expect(response.headers['x-request-id']).toBe('req-123')
  })
})
