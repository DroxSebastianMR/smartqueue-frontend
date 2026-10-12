import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { ErrorResponseDto } from "@/common/dto/error-response.dto";

export interface ApiErrorSpec {
  status: number;
  code: string;
  message: string;
  path: string;
}

/** Keeps documented errors aligned with the global exception envelope. */
export function ApiErrors(...errors: ApiErrorSpec[]) {
  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ...errors.map(({ status, code, message, path }) =>
      ApiResponse({
        status,
        description: message,
        content: {
          "application/json": {
            schema: {
              allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
              example: {
                statusCode: status,
                error:
                  status === 400
                    ? "BAD_REQUEST"
                    : status === 401
                      ? "UNAUTHORIZED"
                      : status === 403
                        ? "FORBIDDEN"
                        : status === 404
                          ? "NOT_FOUND"
                          : status === 409
                            ? "CONFLICT"
                            : status === 429
                              ? "TOO_MANY_REQUESTS"
                              : "INTERNAL_SERVER_ERROR",
                code,
                message,
                path,
                timestamp: "2026-10-11T12:00:00.000Z",
              },
            },
          },
        },
      }),
    ),
  );
}
