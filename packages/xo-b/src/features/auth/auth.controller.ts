import { Body, Controller, HttpCode, Post, Query, Request, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Response } from 'express'
import { ResultToExceptionMapper } from 'src/features/shared/mappers/result-to-exception-mapper'

import { AuthResponseBuilder } from './builders/auth-response.builder'
import {
  AuthenticatedRequest,
  GuestSessionResponseDto,
  LoginDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterDto,
  RegisterResponseDto,
} from './dto/auth.dto'
import { GetUser } from './get-user.decorator'
import { GuestService } from './guest/guest.service'
import { SessionExpirationPolicy } from './guest/session-expiration.policy'
import { JwtRefreshGuard } from './user/jwt-refresh.guard'
import { JwtStatefulAuthGuard } from './user/jwt-stateful-auth.guard'
import { AuthenticatedUser } from './user/model/authenticated-user'
import { UserService } from './user/user.service'
@ApiTags('Authentication - 認證')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly guestService: GuestService,
    private readonly responseBuilder: AuthResponseBuilder,
    private readonly expirationPolicy: SessionExpirationPolicy
  ) {}
  @Post('register')
  @Throttle({ register: {} })
  @ApiOperation({ summary: '註冊新帳號' })
  @ApiResponse({ status: 201, type: RegisterResponseDto })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const result = await this.userService.register(dto.username, dto.password)
    ResultToExceptionMapper.throwIfFailure(result)
    return { userId: result.value!.userId, message: '註冊成功' }
  }
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @Throttle({ login: {} })
  @HttpCode(200)
  @ApiOperation({ summary: '帳號密碼登入' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(
    @Body() _dto: LoginDto,
    @Request() request: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDto> {
    // req.user 由 AuthGuard('local') 注入，dto 僅用於 Swagger 文件顯示
    const result = await this.userService.login(request.user.userId, request.user.username)
    ResultToExceptionMapper.throwIfFailure(result)
    const payload = result.value!
    // 使用 ResponseBuilder 統一管理 Cookie 與響應
    const { response, cookies } = this.responseBuilder.buildLoginResponse(
      payload.accessToken,
      payload.refreshToken,
      request.user.userId,
      request.user.username
    )
    this.responseBuilder.setCookies(res, cookies)
    return response
  }
  @Post('refresh')
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: '刷新 Access Token' })
  @ApiResponse({ status: 200, type: RefreshResponseDto })
  async refresh(
    @GetUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshResponseDto> {
    const result = await this.userService.refreshAccessToken(user.jti!, user.userId, user.username, user.expiresAt!)
    ResultToExceptionMapper.throwIfFailure(result)
    const payload = result.value!
    // 使用 ResponseBuilder 統一管理 Cookie 與響應
    const { response, cookies } = this.responseBuilder.buildRefreshResponse(payload.accessToken, payload.refreshToken)
    this.responseBuilder.setCookies(res, cookies)
    return response
  }
  @Post('logout')
  @UseGuards(JwtStatefulAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: '登出' })
  async logout(
    @GetUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
    @Query('allDevices') allDevices?: string
  ) {
    // 使用 ResponseBuilder 統一清除 Cookie
    this.responseBuilder.clearAuthCookies(res)
    const logoutAll = allDevices === 'true'
    if (logoutAll || !user.deviceId) {
      await this.userService.logoutAllDevices(user.userId)
    } else {
      // 使用 ExpirationPolicy 計算過期時間
      const expiresAt = user.exp ? new Date(user.exp * 1000) : this.expirationPolicy.calculateExpiresAt()
      await this.userService.logoutThisDevice(user.userId, user.deviceId, expiresAt)
    }
  }
  @Post('guest')
  @HttpCode(201)
  @ApiOperation({ summary: '創建訪客 Session' })
  @ApiResponse({ status: 201, type: GuestSessionResponseDto })
  async createGuestSession(): Promise<GuestSessionResponseDto> {
    const session = await this.guestService.createGuestSession()
    return {
      guestId: session.guestId,
      expiresAt: session.expiresAt,
      expiresIn: this.expirationPolicy.getRemainingSeconds(session.expiresAt),
    }
  }
}
