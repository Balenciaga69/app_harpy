import { IsString } from 'class-validator'

/**
 * 刷新商店的請求 DTO
 */
export class RefreshShopDto {
  @IsString()
  runId: string
}
