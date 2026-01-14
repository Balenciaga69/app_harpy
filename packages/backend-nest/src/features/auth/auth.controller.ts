import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GetUser } from './get-user.decorator'
import { GuestService } from './guest/guest.service'
import { RegisterDto } from './user/dto/register.dto'
import { JwtAuthGuard } from './user/jwt-auth.guard'
import { UserService } from './user/user.service'
interface AuthenticatedRequest {
  user: {
    userId: string
    username: string
  }
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly guestService: GuestService
  ) {}
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.userService.register(dto.username, dto.password)
    return { userId: result.userId, message: '註冊成功' }
  }
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  async login(@Request() req: AuthenticatedRequest) {
    const tokens = await this.userService.login(req.user.userId, req.user.username)
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
    const tokens = await this.userService.refreshAccessToken(user.jti, user.userId, user.username)
    return tokens
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async logout(@Request() req: AuthenticatedRequest) {
    await this.userService.logout(req.user.userId)
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
