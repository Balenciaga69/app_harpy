import { Body, Controller, HttpCode, Post, Query, Request, UseGuards, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Response } from 'express'
import { ResultToExceptionMapper } from 'src/features/shared/mappers/result-to-exception-mapper'
import { JWT_CONFIG } from './auth.config'
import {
  GuestSessionResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
  RegisterDto,
} from './dto/auth.dto'
import { GetUser } from './get-user.decorator'
import { GuestService } from './guest/guest.service'
import { JwtAuthGuard } from './user/jwt-auth.guard'
import { JwtRefreshGuard } from './user/jwt-refresh.guard'
import { AuthenticatedUser } from './user/model/authenticated-user'
import { UserService } from './user/user.service'
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
@ApiTags('Authentication - 認證')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly guestService: GuestService,
    private readonly configService: ConfigService
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
    @Request() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginResponseDto> {
    const result = await this.userService.login(req.user.userId, req.user.username)
    ResultToExceptionMapper.throwIfFailure(result)
    const payload = result.value!
    const refreshToken = payload.refreshToken
    const refreshTtl =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS
    const accessTtl =
      this.configService.get<number>('ACCESS_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
    // 設置 Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTtl * 1000,
      path: '/',
    })
    // 設置 Access Token Cookie
    res.cookie('accessToken', payload.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTtl * 1000,
      path: '/',
    })
    return {
      ...payload,
      user: { userId: req.user.userId, username: req.user.username },
    }
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
    const refreshTtl =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.REFRESH_TOKEN_EXPIRY_SECONDS
    const accessTtl =
      this.configService.get<number>('ACCESS_TOKEN_EXPIRY_SECONDS') ?? JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS
    // 更新 Refresh Token Cookie (Rotation)
    res.cookie('refreshToken', payload.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTtl * 1000,
      path: '/',
    })
    // 設置新的 Access Token Cookie
    res.cookie('accessToken', payload.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTtl * 1000,
      path: '/',
    })
    return payload
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: '登出' })
  async logout(
    @GetUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
    @Query('allDevices') allDevices?: string
  ) {
    res.clearCookie('refreshToken', { path: '/' })
    res.clearCookie('accessToken', { path: '/' })
    const logoutAll = allDevices === 'true'
    if (logoutAll || !user.deviceId) {
      await this.userService.logoutAllDevices(user.userId)
    } else {
      // 動態計算 Access Token 的剩餘壽命，避免硬編碼 15 分鐘
      const expiresAt = user.exp
        ? new Date(user.exp * 1000)
        : new Date(Date.now() + JWT_CONFIG.ACCESS_TOKEN_EXPIRY_SECONDS * 1000)
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
      expiresIn: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
    }
  }
}
