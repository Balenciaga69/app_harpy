import { IsString } from 'class-validator'
/**
 * 賣出物品的請求 DTO
 */
export class SellItemDto {
  @IsString()
  runId: string | undefined
  @IsString()
  itemId: string | undefined
}
