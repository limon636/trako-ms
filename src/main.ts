import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global validation pipe ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,          // auto-transform payload types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors();

  // ── API prefix ───────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger docs ─────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Trako API')
    .setDescription('Multi-store inventory & order management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ── Start ─────────────────────────────────────────────────────────────────
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);

  console.log(`🚀 Trako API running on http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs at  http://localhost:${port}/api/docs`);
}
bootstrap();

