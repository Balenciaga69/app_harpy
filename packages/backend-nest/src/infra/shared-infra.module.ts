import { Module, Scope } from '@nestjs/common'
import { ContextManager } from './context/ContextManager'
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
/**
 * 共享基礎設施模組
 * 職責：提供全局跨模組的基礎服務
 *
 * 包含：
 * - ContextManager: 應用上下文管理（AsyncLocalStorage 技術實現）
 * - 配置存儲: 遊戲配置初始化與訪問
 * - 細粒度介面: 技術適配層（NestJS DI ↔ game-core 介面）
 *
 * 層級：infra（基礎設施層）
 * 原因：
 * - ContextManager 是技術實現（AsyncLocalStorage）
 * - 配置加載屬於初始化細節
 * - 介面實現是技術適配層
 *
 * 依賴流向：
 * 所有業務模組 → SharedInfraModule
 * （避免循環依賴）
 */
@Module({
  providers: [
    ...configStoreProviders,
    {
      provide: ContextManager,
      useFactory: (configStore: any) => {
        return new ContextManager(configStore)
      },
      inject: ['CONFIG_STORE'],
      scope: Scope.DEFAULT,
    },
    ...fineGrainedInterfaceProviders,
  ],
  exports: [ContextManager, 'IConfigStoreAccessor', 'IContextSnapshotAccessor', 'IContextMutator', 'CONFIG_STORE'],
})
export class SharedInfraModule {}
