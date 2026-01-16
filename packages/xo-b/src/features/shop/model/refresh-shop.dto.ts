import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
export class RefreshShopDto {
  @ApiProperty({ example: 'run_abc123' })
  @IsString()
  declare runId: string
}
