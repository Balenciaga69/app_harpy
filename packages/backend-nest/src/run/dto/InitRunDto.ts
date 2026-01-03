import { IsString, IsOptional, IsNumber } from 'class-validator';

/**
 * 初始化新 Run 的請求 DTO
 */
export class InitRunDto {
  @IsString()
  professionId: string;

  @IsOptional()
  @IsNumber()
  seed?: number;
}
