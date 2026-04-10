import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global Validation Pipe: Auto-validate DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error if unknown properties are sent
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Global Exception Filter: Standardized error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Logging Interceptor: Request/Response logging with correlation ID
  app.useGlobalInterceptors(new LoggingInterceptor());

  // API Prefix
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Language Learning Core API')
    .setDescription(
      `
## API Endpoints for Language Learning Application

This API provides endpoints for:
- **Courses**: Browse and access language courses
- **Exercises**: CRUD operations for exercise content  
- **Lesson Flow**: Complete lessons and track progress
- **Vocabulary**: SRS-based vocabulary learning

### Authentication
🔒 Authentication will be implemented in a future release.
Currently, user ID is passed as a query parameter for testing.

### Technical Notes
- Uses PostgreSQL 16+ with PgBouncer connection pooling
- JSONB content validation via Zod schemas
- Partitioned tables for high-volume lesson completions
      `,
    )
    .setVersion('1.0')
    .addTag('Courses', 'Course management and curriculum hierarchy')
    .addTag('Exercises', 'Exercise CRUD with JSONB content')
    .addTag('Lesson Flow', 'Lesson completion and progress tracking')
    .addTag('Vocabulary', 'SRS vocabulary learning')
    .addBearerAuth() // Placeholder for future JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
