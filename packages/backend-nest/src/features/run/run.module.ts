import { Module } from '@nestjs/common'
import { RunController } from './controllers/run.controller'
import { RunService } from './services/run.service'
import { ConfigService } from './services/config.service'
import { RunInitServiceWrapper } from './services/run-init-service.wrapper'
import { ShopServiceWrapper } from './services/shop-service.wrapper'
import { InMemoryContextRepository } from '../../infra/repositories/InMemoryContextRepository'
import { ContextUnitOfWorkAdapter } from '../../infra/services/ContextUnitOfWorkAdapter'
import { ItemGenerationService } from '../../infra/services/ItemGenerationService'
import { ShopContextHandler } from '../../infra/services/ShopContextHandler'
import { ShopService } from '../../from-game-core'

/**
 * Run 模組：整合 Run 相關的 Controller、Service、Repository
 *
 * 🎯 DI 設計原則（仿 C# .NET Core）：
 * - 核心業務邏輯 (RunService) → @Injectable()
 * - 基礎設施服務 (ItemGenerationService, etc) → @Injectable()
 * - game-core 的服務 (ShopService) → useFactory
 * - Repository (單例) → @Injectable()
 */
@Module({
  controllers: [RunController],
  providers: [
    // ✅ 核心應用服務（預設 Singleton）
    RunService,
    ConfigService,
    RunInitServiceWrapper,
    ShopServiceWrapper,

    // ✅ 基礎設施服務（預設 Singleton）
    InMemoryContextRepository,
    ContextUnitOfWorkAdapter,
    ItemGenerationService,
    ShopContextHandler,

    // ✅ game-core 的 ShopService 用工廠注入
    // 這是最像 C# 的寫法：services.AddScoped<ShopService>(...)
    {
      provide: ShopService,
      useFactory: (itemGen: ItemGenerationService, ctxHandler: ShopContextHandler) =>
        new ShopService(itemGen as any, ctxHandler as any),
      inject: [ItemGenerationService, ShopContextHandler],
    },
  ],
  exports: [InMemoryContextRepository, ShopService],
})
export class RunModule {}
