import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

/**
 * Global Logging Interceptor.
 * Logs all incoming requests and outgoing responses with timing information.
 * Adds request ID for correlation in distributed tracing.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Generate unique request ID for correlation
    const requestId = randomUUID();
    request['requestId'] = requestId;
    response.setHeader('X-Request-ID', requestId);

    const { method, url, body, query, ip } = request;
    const userAgent = request.get('user-agent') || 'unknown';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      JSON.stringify({
        type: 'REQUEST',
        requestId,
        method,
        url,
        query: Object.keys(query).length > 0 ? query : undefined,
        body: this.sanitizeBody(body),
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      }),
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          // Log successful response
          this.logger.log(
            JSON.stringify({
              type: 'RESPONSE',
              requestId,
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
              responseSize: this.getResponseSize(data),
              timestamp: new Date().toISOString(),
            }),
          );

          // Warn on slow requests (>1s)
          if (duration > 1000) {
            this.logger.warn(
              `Slow request detected: ${method} ${url} took ${duration}ms`,
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log error response
          this.logger.error(
            JSON.stringify({
              type: 'ERROR',
              requestId,
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
              error: {
                name: error.name,
                message: error.message,
              },
              timestamp: new Date().toISOString(),
            }),
          );
        },
      }),
    );
  }

  /**
   * Sanitize request body to remove sensitive data from logs.
   */
  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!body || Object.keys(body).length === 0) {
      return undefined;
    }

    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'apiKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Calculate approximate response size for monitoring.
   */
  private getResponseSize(data: unknown): string {
    if (!data) return '0B';
    try {
      const size = JSON.stringify(data).length;
      if (size < 1024) return `${size}B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
      return `${(size / (1024 * 1024)).toFixed(1)}MB`;
    } catch {
      return 'unknown';
    }
  }
}
