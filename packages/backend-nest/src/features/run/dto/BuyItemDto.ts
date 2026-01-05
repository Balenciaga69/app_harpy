import { IsString } from 'class-validator'
/**
 * 購買商品的請求 DTO
 */
export class BuyItemDto {
  @IsString()
  runId: string | undefined
  @IsString()
  itemId: string | undefined
}
