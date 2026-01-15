import { IsString, MinLength } from 'class-validator'
export class RegisterDto {
  @IsString()
  @MinLength(3, { message: '帳號至少 3 個字符' })
  username!: string
  @IsString()
  @MinLength(8, { message: '密碼至少 8 個字符' })
  password!: string
}
