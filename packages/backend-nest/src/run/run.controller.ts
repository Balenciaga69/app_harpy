import { Controller, Post, Body } from '@nestjs/common';
import { InitRunDto } from './dto/InitRunDto';
import { RunService } from './run.service';

/**
 * Run 控制器：處理與遊戲進度初始化相關的 HTTP 請求
 */
@Controller('api/run')
export class RunController {
  constructor(private readonly runService: RunService) {}

  /**
   * POST /api/run/init - 初始化新遊戲進度
   */
  @Post('init')
  async initializeRun(@Body() dto: InitRunDto) {
    return this.runService.initializeRun(dto);
  }
}
