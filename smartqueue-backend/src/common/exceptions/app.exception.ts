import { HttpException, HttpStatus } from "@nestjs/common";

export class AppException extends HttpException {
  constructor(
    code: string,
    message: string,
    status: HttpStatus,
    meta?: Record<string, unknown>,
  ) {
    super({ code, message, ...(meta ? { meta } : {}) }, status);
  }
}
