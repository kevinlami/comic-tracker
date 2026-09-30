import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Converte a variável CORS_ORIGINS (lista separada por vírgula) em origens.
 * Sem valor configurado, o CORS permanece desabilitado.
 */
function parseAllowedOrigins(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : undefined;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOrigins = parseAllowedOrigins(
    configService.get<string>('CORS_ORIGINS'),
  );

  if (allowedOrigins) {
    app.enableCors({ origin: allowedOrigins });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
