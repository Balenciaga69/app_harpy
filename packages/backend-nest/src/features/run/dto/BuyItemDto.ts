import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * 購買物品的請求 DTO
 *
 * 🎯 流程：
 * - 客戶端指定要購買的 itemId
 * - runId 用於關聯到特定遊戲進度
 */
export class BuyItemDto {
  @ApiProperty({
    description: '遊戲進度 ID',
    example: 'run_abc123',
  })
  @IsString({ message: '遊戲進度 ID 必須是字串' })
  declare runId: string

  @ApiProperty({
    description: '商品 ID (例如: relic_xxxx)',
    example: 'relic_warrior_resolute_heart',
  })
  @IsString({ message: '商品 ID 必須是字串' })
  declare itemId: string
}
