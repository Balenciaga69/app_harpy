import { Injectable } from '@nestjs/common'
import { InMemoryContextRepository } from '../../../infra/repositories/InMemoryContextRepository'
import { ConfigService } from './config.service'
import { RunInitializationService } from '../../../from-game-core'
/**
 * RunInitializationService 包裝器
 * 用途：將 game-core 的 RunInitializationService 包裝為 NestJS Injectable 服務
 * 優點：統一 DI，避免手動 new，保持代碼乾淨
 */
@Injectable()
export class RunInitServiceWrapper {
  constructor(
    private readonly contextRepo: InMemoryContextRepository,
    private readonly configService: ConfigService
  ) {}
  /**
   * 初始化新 Run
   */
  async initialize(professionId: string, seed?: number) {
    const configStore = await this.configService.getConfigStore()
    const runInitService = new RunInitializationService(configStore, this.contextRepo as any)
    return runInitService.initialize({
      professionId,
      seed,
      persist: true,
    })
  }
}
