import { Injectable } from '@nestjs/common'
import {
  RunInitializationService,
  IAppContext,
  IRunContext,
  ICharacterContext,
  IStashContext,
  IShopContext,
} from '../../../from-game-core'
import { ConfigService } from './config.service'
import { AppContextRepository } from '../../../infra/repositories/AppContextRepository'
import { AppContextUnitOfWorkFactory } from '../../../infra/services/AppContextUnitOfWorkFactory'

/**
 * Run 應用服務
 *
 * 職責：
 *   1. 協調 game-core 的業務邏輯與 NestJS 基礎設施
 *   2. 控制異步邊界（加載配置、保存上下文）
 *   3. 決定何時持久化業務邏輯的結果
 *
 * 依賴：
 *   - ConfigService: 加載靜態配置
 *   - UnitOfWorkFactory: 創建業務事務工具
 *   - AppContextRepository: 持久化應用上下文
 *
 * 與 RunInitServiceWrapper 的區別：
 * - ❌ Wrapper：依賴 Adapter，直接 new 業務類，職責混淆
 * - ✅ ApplicationService：注入工廠，清晰的流程
 */
@Injectable()
export class RunApplicationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly unitOfWorkFactory: AppContextUnitOfWorkFactory,
    private readonly contextRepository: AppContextRepository
  ) {}

  /**
   * 初始化新 Run
   *
   * 流程（6 個清晰的步驟）：
   *   1. ✅ 加載配置（異步）
   *   2. ✅ 構建初始 AppContext（完整字段）
   *   3. ✅ 創建 UnitOfWork（業務邏輯工具）
   *   4. ✅ 執行業務邏輯（game-core）
   *   5. ✅ 提交 UnitOfWork（內存同步）
   *   6. ✅ 持久化結果（異步）
   *
   * @param professionId 職業 ID
   * @param seed 隨機種子（可選）
   * @param startingRelicIds 起始聖物 ID（可選）
   * @returns 初始化後的 AppContext
   * @throws Error 如果初始化失敗或持久化失敗
   */
  async initializeRun(professionId: string, seed?: number, startingRelicIds?: string[]): Promise<IAppContext> {
    // ========== 步驟 1: 加載配置 ==========
    const configStore = await this.configService.getConfigStore()

    // ========== 步驟 2: 構建初始 AppContext ==========
    // ⚠️ 注意：所有字段都應該被初始化，不應該使用空對象
    const initialContext = this.buildInitialAppContext(configStore)

    // ========== 步驟 3: 創建 UnitOfWork ==========
    const unitOfWork = this.unitOfWorkFactory.createUnitOfWork(initialContext)

    // ========== 步驟 4: 執行業務邏輯 ==========
    // game-core 的 RunInitializationService 是純業務邏輯
    // 它內部使用 UnitOfWork 來收集變更
    const runInitService = new RunInitializationService(configStore, unitOfWork)

    const result = await runInitService.initialize({
      professionId,
      seed,
      startingRelicIds,
      persist: false, // ⭐ 不使用 game-core 的持久化，我們手動控制
    })

    // 檢查業務邏輯是否成功
    if (result.isFailure) {
      throw new Error(`Run initialization failed: ${result.error}`)
    }

    // ========== 步驟 5: 此時 UnitOfWork 已自動更新了 initialContext ==========
    // game-core 的 AppContextService 基於不可變性重建了 appContext
    // 現在 result.value 包含完整的更新後的 AppContext

    // ========== 步驟 6: 持久化結果 ==========
    this.contextRepository.save(result.value!)

    return result.value!
  }

  /**
   * 構建初始 AppContext
   *
   * ⚠️ 重要：必須完整初始化所有字段！
   * 不應該使用 `{} as IRunContext` 的方式
   *
   * 這裡的初始值應該與 game-core 的初始化邏輯相匹配
   */
  private buildInitialAppContext(configStore: any): IAppContext {
    // 如果 game-core 提供了初始化輔助函數，應該使用它
    // 否則，根據領域模型文檔手動構建

    return {
      configStore,
      contexts: {
        runContext: this.buildInitialRunContext(),
        characterContext: this.buildInitialCharacterContext(),
        stashContext: this.buildInitialStashContext(),
        shopContext: this.buildInitialShopContext(),
      },
    }
  }

  /**
   * 構建初始 RunContext
   */
  private buildInitialRunContext(): IRunContext {
    return {
      runId: '', // 會被 RunInitializationService 填充
      version: 0,
      encounteredEnemyIds: [],
      chapters: {},
      rollModifiers: [],
      remainingFailRetries: 0,
      currentChapter: 0,
      currentStage: 0,
      seed: 0,
      status: 'UNINITIALIZED',
      money: 0,
      temporaryContext: {
        postCombat: undefined,
      },
    } as unknown as IRunContext
  }

  /**
   * 構建初始 CharacterContext
   */
  private buildInitialCharacterContext(): ICharacterContext {
    return {
      id: '',
      runId: '',
      version: 0,
    } as unknown as ICharacterContext
  }

  /**
   * 構建初始 StashContext
   */
  private buildInitialStashContext(): IStashContext {
    return {
      runId: '',
      version: 0,
      items: [],
      capacity: 0,
    } as unknown as IStashContext
  }

  /**
   * 構建初始 ShopContext
   */
  private buildInitialShopContext(): IShopContext {
    return {
      runId: '',
      version: 0,
      shopConfigId: '',
      items: [],
      refreshCount: 0,
    } as unknown as IShopContext
  }
}
