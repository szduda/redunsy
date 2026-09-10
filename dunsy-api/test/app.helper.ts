import type { INestApplication } from '@nestjs/common'

import { createDunsyApp } from '../src/bootstrap'
import { INTERNAL_KEY_HEADER } from '../src/config/security'

export const TEST_INTERNAL_KEY = 'test-internal-key'

export const startTestApp = async (): Promise<INestApplication> => {
  process.env.DUNSY_API_INTERNAL_KEY = TEST_INTERNAL_KEY
  const app = await createDunsyApp()
  await app.init()
  return app
}

export const withInternalKey = (headers: Record<string, string> = {}) => ({
  [INTERNAL_KEY_HEADER]: TEST_INTERNAL_KEY,
  ...headers,
})
