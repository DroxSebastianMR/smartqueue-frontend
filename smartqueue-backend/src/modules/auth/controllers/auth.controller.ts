import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ApiErrors } from "@/common/decorators/api-errors.decorator";
import { ErrorCode } from "@/common/enums/error-code.enum";
import { AuthService } from "@/modules/auth/services/auth.service";
import { AuthErrorCode } from "@/modules/auth/enums/auth-error-code.enum";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  MessageDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  SessionDto,
} from "@/modules/auth/dto/auth-action.dto";
import { LoginDto } from "@/modules/auth/dto/login.dto";
import {
  LoginResponseDto,
  SessionUserDto,
} from "@/modules/auth/dto/login-response.dto";
import {
  AccessTokenGuard,
  type AuthenticatedRequest,
} from "@/modules/auth/guards/access-token.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Iniciar sesión; emite JWT y refresh token" })
  @ApiOkResponse({ type: LoginResponseDto, description: "Sesión iniciada" })
  @ApiErrors(
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Solicitud de login inválida",
      path: "/api/v1/auth/login",
    },
    {
      status: 401,
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message: "Credenciales inválidas",
      path: "/api/v1/auth/login",
    },
    {
      status: 429,
      code: AuthErrorCode.RATE_LIMITED,
      message: "Demasiados intentos",
      path: "/api/v1/auth/login",
    },
  )
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.auth.login(dto.email, dto.password);
  }

  @Post("register")
  @ApiOperation({ summary: "Registrar cliente" })
  @ApiCreatedResponse({
    type: LoginResponseDto,
    description: "Cliente registrado; sesión iniciada",
  })
  @ApiErrors(
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Datos de registro inválidos",
      path: "/api/v1/auth/register",
    },
    {
      status: 409,
      code: AuthErrorCode.EMAIL_TAKEN,
      message: "El correo ya está registrado",
      path: "/api/v1/auth/register",
    },
  )
  register(@Body() dto: RegisterDto): LoginResponseDto {
    return this.auth.register(dto.email, dto.password);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rotar refresh token y renovar sesión" })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: "Sesión renovada; el refresh anterior queda revocado",
  })
  @ApiErrors(
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Refresh token requerido",
      path: "/api/v1/auth/refresh",
    },
    {
      status: 401,
      code: AuthErrorCode.SESSION_REVOKED,
      message: "Sesión inválida o vencida",
      path: "/api/v1/auth/refresh",
    },
  )
  refresh(@Body() dto: RefreshDto): LoginResponseDto {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get("me")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Obtener el usuario autenticado" })
  @ApiOkResponse({ type: SessionUserDto })
  @ApiErrors({
    status: 401,
    code: AuthErrorCode.TOKEN_INVALID,
    message: "Token inválido o sesión revocada",
    path: "/api/v1/auth/me",
  })
  me(@Req() request: AuthenticatedRequest): SessionUserDto {
    return request.user;
  }

  @Get("permissions")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Roles y permisos efectivos del usuario" })
  @ApiOkResponse({ type: SessionUserDto })
  @ApiErrors({
    status: 401,
    code: AuthErrorCode.TOKEN_INVALID,
    message: "Token inválido o sesión revocada",
    path: "/api/v1/auth/permissions",
  })
  permissions(@Req() request: AuthenticatedRequest): SessionUserDto {
    return request.user;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Cerrar la sesión actual" })
  @ApiOkResponse({ type: MessageDto })
  @ApiErrors({
    status: 401,
    code: AuthErrorCode.TOKEN_INVALID,
    message: "Token inválido",
    path: "/api/v1/auth/logout",
  })
  logout(@Req() request: AuthenticatedRequest): MessageDto {
    this.auth.logout(request.user.id, request.sessionId);
    return { message: "Sesión cerrada" };
  }

  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Cerrar todas las sesiones del usuario" })
  @ApiOkResponse({ type: MessageDto })
  @ApiErrors({
    status: 401,
    code: AuthErrorCode.TOKEN_INVALID,
    message: "Token inválido",
    path: "/api/v1/auth/logout-all",
  })
  logoutAll(@Req() request: AuthenticatedRequest): MessageDto {
    this.auth.logoutAll(request.user.id);
    return { message: "Todas las sesiones fueron cerradas" };
  }

  @Get("sessions")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Listar sesiones activas propias" })
  @ApiOkResponse({ type: SessionDto, isArray: true })
  @ApiErrors({
    status: 401,
    code: AuthErrorCode.TOKEN_INVALID,
    message: "Token inválido",
    path: "/api/v1/auth/sessions",
  })
  sessions(@Req() request: AuthenticatedRequest): SessionDto[] {
    return this.auth.listSessions(request.user.id);
  }

  @Delete("sessions/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Revocar una sesión propia" })
  @ApiParam({
    name: "id",
    format: "uuid",
    description: "Identificador de sesión",
  })
  @ApiOkResponse({ type: MessageDto })
  @ApiErrors(
    {
      status: 401,
      code: AuthErrorCode.TOKEN_INVALID,
      message: "Token inválido",
      path: "/api/v1/auth/sessions/:id",
    },
    {
      status: 404,
      code: AuthErrorCode.SESSION_REVOKED,
      message: "Sesión no encontrada",
      path: "/api/v1/auth/sessions/:id",
    },
  )
  revokeSession(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
  ): MessageDto {
    this.auth.revokeSession(request.user.id, id);
    return { message: "Sesión revocada" };
  }

  @Post("password/change")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Cambiar contraseña y revocar todas las sesiones" })
  @ApiOkResponse({ type: MessageDto })
  @ApiErrors(
    {
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: "Contraseña nueva inválida",
      path: "/api/v1/auth/password/change",
    },
    {
      status: 401,
      code: AuthErrorCode.PASSWORD_INVALID,
      message: "Contraseña actual incorrecta",
      path: "/api/v1/auth/password/change",
    },
  )
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ): MessageDto {
    this.auth.changePassword(
      request.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
    return { message: "Contraseña actualizada; inicia sesión nuevamente" };
  }

  @Post("password/forgot")
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Generar recuperación local; sin envío de correo" })
  @ApiAcceptedResponse({
    type: ForgotPasswordResponseDto,
    description:
      "En desarrollo retorna un token temporal si el correo existe; aún no envía email",
  })
  @ApiErrors({
    status: 400,
    code: ErrorCode.VALIDATION_ERROR,
    message: "Correo inválido",
    path: "/api/v1/auth/password/forgot",
  })
  forgotPassword(@Body() dto: ForgotPasswordDto): ForgotPasswordResponseDto {
    return this.auth.forgotPassword(dto.email);
  }

  @Post("password/reset")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Restablecer contraseña con token de un solo uso" })
  @ApiOkResponse({ type: MessageDto })
  @ApiErrors({
    status: 400,
    code: AuthErrorCode.RESET_TOKEN_INVALID,
    message: "Token inválido o vencido",
    path: "/api/v1/auth/password/reset",
  })
  resetPassword(@Body() dto: ResetPasswordDto): MessageDto {
    this.auth.resetPassword(dto.token, dto.newPassword);
    return { message: "Contraseña restablecida" };
  }
}
