import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as bcrypt from 'bcrypt'
import { Strategy } from 'passport-local'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { AuthenticatedUser } from '../model/authenticated-user'
import { IUserRepository } from '../repository/user.repository'
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(InjectionTokens.UserRepository)
    private readonly userRepository: IUserRepository
  ) {
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
