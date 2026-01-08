import { Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import {
  AppContextHolder,
  ConfigStoreAccessorImpl,
  ContextMutatorImpl,
  ContextSnapshotAccessorImpl,
  IAppContext,
} from 'src/from-game-core'
import { ContextManager } from '../context/ContextManager'
/**
 * 細粒度介面提供者
 * 職責：提供 game-core 定義的細粒度介面實現
 * - IConfigStoreAccessor: 配置存儲訪問
 * - IContextSnapshotAccessor: 上下文快照訪問
 * - IContextMutator: 上下文變異
 * - AppContextHolder: 應用上下文容器
 *
 * 層級：infra（技術適配層）
 * 原因：這些是技術細節，用於連接 NestJS DI 與 game-core 的介面定義
 *
 * ⚠️ 重要說明：
 * - AppContextHolder 必須是 REQUEST scope，每個請求獨立
 * - 其他 AccessorImpl 依賴 AppContextHolder
 * - ContextManager 必須是 singleton，持有全局 ConfigStore
 * - ConfigStore 由 ContextManager 提供，不再深拷貝
 */
export const fineGrainedInterfaceProviders = [
  {
    provide: AppContextHolder,
    useFactory: (contextManager: ContextManager, request: any) => {
      const body = request.body as Record<string, any>
      const runId = body?.runId as string | undefined

      let currentContext: IAppContext | undefined

      // ⭐ 優先從持久存儲獲取完整 context
      if (runId && typeof runId === 'string') {
        const persistedContext = contextManager.getContextByRunId(runId)
        if (persistedContext) {
          currentContext = persistedContext
        }
      }

      // ⭐ 如果沒有找到，創建一個默認的（包含全局 ConfigStore）
      if (!currentContext) {
        currentContext = {
          configStore: contextManager.getConfigStore(),
          contexts: {
            runContext: {} as IAppContext['contexts']['runContext'],
            characterContext: {} as IAppContext['contexts']['characterContext'],
            stashContext: {} as IAppContext['contexts']['stashContext'],
            shopContext: {} as IAppContext['contexts']['shopContext'],
          },
        }
      }

      return new AppContextHolder(currentContext)
    },
    inject: [ContextManager, REQUEST],
    scope: Scope.REQUEST,
  },
  {
    provide: 'IConfigStoreAccessor',
    useFactory: (holder: AppContextHolder) => {
      return new ConfigStoreAccessorImpl(holder)
    },
    inject: [AppContextHolder],
    scope: Scope.REQUEST,
  },
  {
    provide: 'IContextSnapshotAccessor',
    useFactory: (holder: AppContextHolder) => {
      return new ContextSnapshotAccessorImpl(holder)
    },
    inject: [AppContextHolder],
    scope: Scope.REQUEST,
  },
  {
    provide: 'IContextMutator',
    useFactory: (holder: AppContextHolder) => {
      return new ContextMutatorImpl(holder)
    },
    inject: [AppContextHolder],
    scope: Scope.REQUEST,
  },
]
