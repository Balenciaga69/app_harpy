import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNumber, IsOptional, IsString, MinLength } from 'class-validator'
export class InitRunDto {
  @ApiProperty({ example: 'WARRIOR' })
  @IsString()
  @MinLength(1)
  declare professionId: string
  @ApiPropertyOptional({ example: 12345 })
  @IsOptional()
  @IsNumber()
  seed?: number
  @ApiPropertyOptional({
    example: ['relic_warrior_resolute_heart'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  startingRelicIds?: string[]
}
