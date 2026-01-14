import { IsString, MinLength } from 'class-validator'
export class LoginDto {
  @IsString()
  @MinLength(3, { message: '帳號至少 3 個字符' })
  username!: string
  @IsString()
  @MinLength(6, { message: '密碼至少 6 個字符' })
  password!: string
}
