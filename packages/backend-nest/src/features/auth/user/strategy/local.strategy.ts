import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as bcrypt from 'bcrypt'
import { Strategy } from 'passport-local'
import { AuthenticatedUser } from '../model/authenticated-user.ts'
import { RedisUserRepository } from '../repository/user.repository'
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: RedisUserRepository) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    })
  }
  async validate(username: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findActiveByUsername(username)
    if (!user) {
      throw new UnauthorizedException('帳號不存在或已停用')
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('密碼錯誤')
    }
    return { userId: user.id, username: user.username }
  }
}
