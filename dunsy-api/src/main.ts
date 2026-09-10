import 'reflect-metadata'

import { createDunsyApp } from './bootstrap'

const bootstrap = async () => {
  const app = await createDunsyApp()
  const port = Number(process.env.PORT ?? 3001)
  await app.listen(port)
}

void bootstrap()
