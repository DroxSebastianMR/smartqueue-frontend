import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ErrorCode } from "@/common/enums/error-code.enum";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (status: number) => { json: (body: unknown) => void };
    }>();
    const request = host.switchToHttp().getRequest<{ url: string }>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const detail =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const data =
      typeof detail === "object" && detail !== null
        ? (detail as Record<string, unknown>)
        : {};
    const message = Array.isArray(data.message)
      ? data.message.join("; ")
      : typeof data.message === "string"
        ? data.message
        : typeof detail === "string"
          ? detail
          : statusCode === 500
            ? "Error interno del servidor"
            : "Solicitud no válida";
    if (statusCode >= 500) this.logger.error(exception);
    response.status(statusCode).json({
      statusCode,
      error: HttpStatus[statusCode] ?? "HTTP_ERROR",
      code:
        typeof data.code === "string"
          ? data.code
          : statusCode === 400
            ? ErrorCode.VALIDATION_ERROR
            : statusCode === 500
              ? ErrorCode.INTERNAL_ERROR
              : ErrorCode.HTTP_ERROR,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(data.meta ? { meta: data.meta } : {}),
    });
  }
}
