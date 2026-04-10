import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine HTTP status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract error message
    let message: string | object;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message ||
            exception.message;
    } else if (exception instanceof Error) {
      // For non-HTTP exceptions, use generic message in production
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message;
    } else {
      message = 'Internal server error';
    }

    // Build error response
    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Structured logging
    const logPayload = {
      ...errorResponse,
      // Include stack trace in logs (but not in response)
      stack: exception instanceof Error ? exception.stack : undefined,
      // Request metadata for debugging
      userId: (request as unknown as { user?: { sub?: string } }).user?.sub,
      body: this.sanitizeBody(request.body as Record<string, unknown>),
    };

    // Log based on severity
    if (status >= 500) {
      this.logger.error(JSON.stringify(logPayload, null, 2));
    } else if (status >= 400) {
      this.logger.warn(JSON.stringify(logPayload));
    }

    // Send response (without stack trace)
    response.status(status).json(errorResponse);
  }

  /**
   * Sanitize request body for logging.
   * Removes sensitive fields like passwords.
   */
  private sanitizeBody(
    body: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') {
      return undefined;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret'];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

/**
 * HttpExceptionFilter - Catches only HTTP exceptions.
 * Use AllExceptionsFilter for comprehensive error handling.
 *
 * @deprecated Use AllExceptionsFilter instead
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Handle validation errors (class-validator returns object with message array)
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : exception.message;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // Log 5xx errors as errors, 4xx as warnings
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception.stack,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
