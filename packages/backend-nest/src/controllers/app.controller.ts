import { Controller, Get } from '@nestjs/common';

/**
 * Health Check 控制器
 * 用途：監控應用健康狀態，用於負載均衡器和監控系統
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
