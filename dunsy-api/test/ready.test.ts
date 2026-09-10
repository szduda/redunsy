import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { startTestApp, withInternalKey } from './app.helper'

describe('GET /ready', () => {
  let app: INestApplication

  beforeAll(async () => {
    delete process.env.POSTGRES_URL
    delete process.env.DATABASE_URL
    app = await startTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('requires the internal key', async () => {
    const response = await request(app.getHttpServer()).get('/ready')
    expect(response.status).toBe(401)
  })

  it('reports unconfigured database when POSTGRES_URL is missing', async () => {
    const response = await request(app.getHttpServer()).get('/ready').set(withInternalKey())
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', database: 'unconfigured' })
  })
})
