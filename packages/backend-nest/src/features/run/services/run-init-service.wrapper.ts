import { Injectable } from '@nestjs/common'
import { ContextUnitOfWorkAdapter } from '../../../infra/services/ContextUnitOfWorkAdapter'
import { ConfigService } from './config.service'
import {
  RunInitializationService,
  IAppContext,
  IRunContext,
  ICharacterContext,
  IStashContext,
  IShopContext,
} from '../../../from-game-core'
/**
 * RunInitializationService 包裝器
 * 用途：將 game-core 的 RunInitializationService 包裝為 NestJS Injectable 服務
 * 優點：統一 DI，避免手動 new，保持代碼乾淨
 *
 * 改進：
 * - 移除 as any 強制轉換（完全類型安全）
 * - 使用 ContextUnitOfWorkAdapter 正確實現 IContextUnitOfWork
 * - 自動同步到 InMemoryContextRepository（持久化）
 */
@Injectable()
export class RunInitServiceWrapper {
  constructor(
    private readonly configService: ConfigService,
    private readonly unitOfWorkAdapter: ContextUnitOfWorkAdapter
  ) {}

  /**
   * 初始化新 Run
   * @param professionId 職業 ID（必須）
   * @param seed 隨機種子（可選）
   * @param startingRelicIds 起始聖物 ID 陣列（可選，最多 1 個）
   */
  async initialize(professionId: string, seed?: number, startingRelicIds?: string[]) {
    const configStore = await this.configService.getConfigStore()

    // 建立初始應用上下文
    const initialContext: IAppContext = {
      configStore,
      contexts: {
        runContext: {} as IRunContext,
        characterContext: {} as ICharacterContext,
        stashContext: {} as IStashContext,
        shopContext: {} as IShopContext,
      },
    }

    // 使用適配器建立 UnitOfWork（支持自動持久化）
    const unitOfWork = this.unitOfWorkAdapter.createUnitOfWork(initialContext)

    // 建立 RunInitializationService（類型完全安全）
    const runInitService = new RunInitializationService(configStore, unitOfWork)

    // 執行初始化
    return runInitService.initialize({
      professionId,
      seed,
      startingRelicIds,
      persist: true,
    })
  }
}
