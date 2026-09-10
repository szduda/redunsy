import type { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { startTestApp, withInternalKey } from './app.helper'

describe('browser Origin rejection', () => {
  let app: INestApplication

  beforeAll(async () => {
    app = await startTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('rejects the production frontend origin even with a valid key', async () => {
    const response = await request(app.getHttpServer())
      .get('/v1/connection/whoami')
      .set(withInternalKey({ Origin: 'https://re.dunsy.app' }))
    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('BROWSER_ORIGIN_FORBIDDEN')
  })

  it('rejects localhost:3000 (Next dev origin)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'http://localhost:3000')
    expect(response.status).toBe(403)
  })

  it('rejects Vercel preview origins', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://redunsy-git-main-szduda.vercel.app')
    expect(response.status).toBe(403)
  })
})
