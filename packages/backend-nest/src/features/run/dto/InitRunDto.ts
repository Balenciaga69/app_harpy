import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator'
/**
 * 初始化新 Run 的請求 DTO
 */
export class InitRunDto {
  @IsString()
  professionId: string | undefined
  @IsOptional()
  @IsNumber()
  seed?: number
  @IsOptional()
  @IsArray()
  // 可選的起始聖物 id 列表（目前只允許最多一個）
  // 前端可傳入使用者選擇的起始聖物，用於初始化時替換職業預設聖物
  startingRelicIds?: string[]
}
