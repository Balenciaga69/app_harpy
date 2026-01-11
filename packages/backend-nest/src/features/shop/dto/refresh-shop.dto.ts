import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
export class RefreshShopDto {
  @ApiProperty({
    description: '遊戲進度 ID',
    example: 'run_abc123',
  })
  @IsString({ message: '遊戲進度 ID 必須是字串' })
  declare runId: string
}
