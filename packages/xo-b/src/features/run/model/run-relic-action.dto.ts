import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
export class RunRelicActionDto {
  @IsString()
  @ApiProperty()
  runId!: string
  @IsString()
  @ApiProperty()
  relicId!: string
}
