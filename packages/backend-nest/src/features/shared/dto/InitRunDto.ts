import { IsString, IsOptional, IsNumber, IsArray, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
export class InitRunDto {
  @ApiProperty({
    description: '職業 ID (例如: WARRIOR, MAGE, ROGUE)',
    example: 'WARRIOR',
  })
  @IsString({ message: '職業 ID 必須是字串' })
  @MinLength(1, { message: '職業 ID 不能為空' })
  declare professionId: string
  @ApiPropertyOptional({
    description: '隨機種子，用於重現同樣的遊戲進度。若不提供則隨機生成',
    example: 12345,
    type: 'number',
  })
  @IsOptional()
  @IsNumber({}, { message: '種子必須是數字' })
  seed?: number
  @ApiPropertyOptional({
    description: '起始聖物 ID 列表（目前只允許最多一個）。若提供則替換職業預設聖物',
    example: ['relic_warrior_resolute_heart'],
    isArray: true,
    type: 'string',
  })
  @IsOptional()
  @IsArray({ message: '起始聖物 ID 必須是陣列' })
  @IsString({ each: true, message: '每個聖物 ID 必須是字串' })
  startingRelicIds?: string[]
}
