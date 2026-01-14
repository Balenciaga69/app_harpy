import { Body, Controller, Get, HttpCode, Post, Request, Res, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { IsAuthenticatedGuard } from './auth.guard'
import { AuthService } from './auth.service'
import type { AuthenticatedUser } from './jwt.strategy'
import { TokenBlacklistService } from './token-blacklist.service'
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklist: TokenBlacklistService
  ) {}
  @Post('guest')
  @HttpCode(200)
  // 建立訪客/匿名用戶
  async createGuest() {
    const { token, userId } = await this.authService.createAnonymousSession()
    return {
      success: true,
      data: {
        accessToken: token,
        userId,
      },
    }
  }
  @Post('login')
  @Throttle({ login: { limit: 3, ttl: 300000 } })
  @HttpCode(200)
  // 登入
  async login(@Body() body: { username: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.username, body.password)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return {
      success: true,
      data: { accessToken: result.accessToken },
    }
  }
  @Post('refresh')
  @HttpCode(200)
  // 刷新 access token
  refresh(@Body() body: { refreshToken: string }) {
    const accessToken = this.authService.refreshAccessToken(body.refreshToken)
    return {
      success: true,
      data: { accessToken },
    }
  }
  @Post('upgrade')
  @UseGuards(IsAuthenticatedGuard)
  @HttpCode(200)
  // 將 anonymous 轉為 authenticated
  async upgrade(
    @Request() req: { user: AuthenticatedUser },
    @Body() body: { username: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.upgradeAnonymousToAuthenticated(req.user.userId, body.username)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return {
      success: true,
      data: { accessToken: result.accessToken },
    }
  }
  @Get('me')
  // 取得 current user
  @UseGuards(IsAuthenticatedGuard)
  getCurrentUser(@Request() req: { user: AuthenticatedUser }) {
    return {
      success: true,
      data: req.user,
    }
  }
  @Post('logout')
  @UseGuards(IsAuthenticatedGuard)
  @HttpCode(200)
  async logout(@Request() req: { headers: Record<string, string> }) {
    const authHeader = req.headers.authorization ?? ''
    const token = authHeader.replace('Bearer ', '')
    if (token) {
      const tokenDigest = token.substring(0, Math.min(32, token.length))
      await this.tokenBlacklist.addToBlacklist(tokenDigest, 7 * 24 * 60 * 60)
    }
    return {
      success: true,
      data: { message: 'Logged out successfully' },
    }
  }
}
