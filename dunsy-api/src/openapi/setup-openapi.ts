import { INestApplication, ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export const buildOpenApiConfig = () =>
  new DocumentBuilder()
    .setTitle('dunsy-api')
    .setDescription(
      'Dunsy HTTP API. Browser clients must not call this origin; the Next.js BFF is the only caller.',
    )
    .setVersion('0.1.0')
    .addApiKey({ type: 'apiKey', name: 'x-dunsy-internal-key', in: 'header' }, 'internal-key')
    .build()

export const setupOpenApi = (app: INestApplication) => {
  const document = SwaggerModule.createDocument(app, buildOpenApiConfig())
  SwaggerModule.setup('docs', app, document, { jsonDocumentUrl: 'docs-json' })
  return document
}

export const validationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
