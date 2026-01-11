import { Body, Controller, Get, HttpCode, Post, Request, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'

import { AuthService } from './app/auth.service'
import { IsAuthenticatedGuard } from './infra/auth.guard'
import type { AuthenticatedUser } from './infra/jwt.strategy'
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('guest')
  @HttpCode(200)
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
  @HttpCode(200)
  async login(@Body() body: { username: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.username, body.password)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
  async upgrade(
    @Request() req: { user: AuthenticatedUser },
    @Body() body: { username: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.upgradeAnonymousToAuthenticated(req.user.userId, body.username)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return {
      success: true,
      data: { accessToken: result.accessToken },
    }
  }
  @Get('me')
  @UseGuards(IsAuthenticatedGuard)
  getCurrentUser(@Request() req: { user: AuthenticatedUser }) {
    return {
      success: true,
      data: req.user,
    }
  }
}
