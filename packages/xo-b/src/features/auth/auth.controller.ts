import { Body, Controller, HttpCode, Post, Query, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Throttle } from '@nestjs/throttler'
import { ResultToExceptionMapper } from 'src/features/shared/mappers/result-to-exception-mapper'
import { RegisterDto } from './dto/register.dto'
import { GetUser } from './get-user.decorator'
import { GuestService } from './guest/guest.service'
import { JwtAuthGuard } from './user/jwt-auth.guard'
import { UserService } from './user/user.service'
interface AuthenticatedRequest {
  user: {
    userId: string
    username: string
    deviceId?: string
  }
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly guestService: GuestService
  ) {}
  @Post('register')
  @Throttle('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.userService.register(dto.username, dto.password)
    ResultToExceptionMapper.throwIfFailure(result)
    return { userId: result.value!.userId, message: '註冊成功' }
  }
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @Throttle('login')
  @HttpCode(200)
  async login(@Request() req: AuthenticatedRequest) {
    const result = await this.userService.login(req.user.userId, req.user.username)
    ResultToExceptionMapper.throwIfFailure(result)
    const tokens = result.value!
    return {
      ...tokens,
      user: {
        userId: req.user.userId,
        username: req.user.username,
      },
    }
  }
  @Post('refresh')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async refresh(@GetUser() user: { userId: string; username: string; jti: string }) {
    const result = await this.userService.refreshAccessToken(user.jti, user.userId, user.username)
    ResultToExceptionMapper.throwIfFailure(result)
    return result.value!
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async logout(@GetUser() user: { userId: string; deviceId?: string }, @Query('allDevices') allDevices?: string) {
    const logoutAll = allDevices === 'true'
    // 如果 登出所有裝置
    if (logoutAll) {
      await this.userService.logoutAllDevices(user.userId)
    }
    // 如果 指定裝置登出
    else if (user.deviceId) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      await this.userService.logoutThisDevice(user.userId, user.deviceId, expiresAt)
    }
    // 否則 預設登出所有裝置
    else {
      await this.userService.logoutAllDevices(user.userId)
    }
  }
  @Post('guest')
  @HttpCode(201)
  async createGuestSession() {
    const session = await this.guestService.createGuestSession()
    return {
      guestId: session.guestId,
      expiresAt: session.expiresAt,
      expiresIn: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
    }
  }
}
