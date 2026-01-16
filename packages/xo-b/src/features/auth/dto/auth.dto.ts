import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'
import { Request } from 'express'
import { AuthenticatedUser } from '../user/model/authenticated-user'
/** 登入請求 DTO */
export class LoginDto {
  @ApiProperty()
  @IsString()
  username!: string
  @ApiProperty()
  @IsString()
  password!: string
}
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
/** 已驗證的使用者資訊 */
export class AuthenticatedUserDto {
  @ApiProperty()
  userId!: string
  @ApiProperty()
  username!: string
}
/** 註冊請求 DTO */
export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3, { message: '帳號至少 3 個字符' })
  username!: string
  @ApiProperty()
  @IsString()
  @MinLength(8, { message: '密碼至少 8 個字符' })
  password!: string
}
export class RegisterResponseDto {
  @ApiProperty()
  userId!: string
  @ApiProperty()
  message!: string
}
export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string
  @ApiProperty()
  refreshToken!: string
  @ApiProperty()
  expiresIn!: number
  @ApiProperty({
    example: { userId: 'uuid', username: 'john' },
  })
  user!: {
    userId: string
    username: string
  }
}
export class RefreshResponseDto {
  @ApiProperty()
  accessToken!: string
  @ApiProperty()
  refreshToken!: string
  @ApiProperty()
  expiresIn!: number
}
export class GuestSessionResponseDto {
  @ApiProperty()
  guestId!: string
  @ApiProperty()
  expiresAt!: Date
  @ApiProperty()
  expiresIn!: number
}
