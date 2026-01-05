import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
/**
 * 刷新商店的請求 DTO
 *
 * 🎯 流程：
 * - 指定遊戲進度 ID
 * - 觸發商店物品刷新
 */
export class RefreshShopDto {
  @ApiProperty({
    description: '遊戲進度 ID',
    example: 'run_abc123',
  })
  @IsString({ message: '遊戲進度 ID 必須是字串' })
  declare runId: string
}
