import { Module } from '@nestjs/common'
import { RunController } from './controllers/run.controller'
import { RunService } from './services/run.service'
import { ConfigService } from './services/config.service'
import { RunApplicationService } from './services/run-application.service'
import { ShopServiceWrapper } from './services/shop-service.wrapper'
import { AppContextRepository } from '../../infra/repositories/AppContextRepository'
import { AppContextUnitOfWorkFactory } from '../../infra/services/AppContextUnitOfWorkFactory'
import { ShopService } from '../../from-game-core'

/**
 * Run 模組：整合 Run 相關的 Controller、Service、Repository
 *
 * 架構層級：
 * - Controllers (HTTP)
 * - Services (應用層 + 業務邏輯適配)
 * - Application Services (協調層)
 * - Infrastructure (Repository + Factory)
 *
 * 職責分離：
 * ✅ ConfigService - 加載靜態配置
 * ✅ AppContextRepository - 持久化完整的 IAppContext
 * ✅ AppContextUnitOfWorkFactory - 創建業務事務工具
 * ✅ RunApplicationService - 協調初始化流程
 * ✅ RunService - HTTP 適配層
 *
 * 刪除：
 * ❌ ContextUnitOfWorkAdapter (被 Factory 替代)
 * ❌ RunInitServiceWrapper (被 ApplicationService 替代)
 * ❌ InMemoryContextRepository (被 AppContextRepository 替代)
 * ❌ ItemGenerationService (應屬於 game-core)
 * ❌ ShopContextHandler (職責混淆)
 */
@Module({
  controllers: [RunController],
  providers: [
    // 配置服務（加載靜態數據）
    ConfigService,

    // 基礎設施層（持久化 + 工具）
    AppContextRepository,
    AppContextUnitOfWorkFactory,

    // 應用服務層（協調流程）
    RunApplicationService,

    // HTTP 適配層（可選）
    RunService,

    // game-core 的服務
    {
      provide: ShopService,
      useClass: ShopService,
    },
    ShopServiceWrapper,
  ],
  exports: [ConfigService, RunApplicationService, AppContextRepository],
})
export class RunModule {}
