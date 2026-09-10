import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '../src/app.module'
import { buildOpenApiConfig } from '../src/openapi/setup-openapi'

const writeOpenApi = async () => {
  const app = await NestFactory.create(AppModule, { logger: false })
  const document = SwaggerModule.createDocument(app, buildOpenApiConfig())
  await app.close()

  const target = join(process.cwd(), 'openapi.json')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`)
  process.stdout.write(`Wrote ${target}\n`)
}

void writeOpenApi()
