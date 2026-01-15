import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
export class BuyItemDto {
  @ApiProperty({ example: 'run_abc123' })
  @IsString()
  declare runId: string
  @ApiProperty({ example: 'relic_warrior_resolute_heart' })
  @IsString()
  declare itemId: string
}
