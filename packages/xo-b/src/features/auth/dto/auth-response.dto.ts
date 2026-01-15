import { ApiProperty } from '@nestjs/swagger'
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
