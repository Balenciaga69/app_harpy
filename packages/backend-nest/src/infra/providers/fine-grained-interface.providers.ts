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
 */
export const fineGrainedInterfaceProviders = [
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
  {
    provide: AppContextHolder,
    useFactory: (contextManager: ContextManager, request: any) => {
      const body = request.body as Record<string, any>
      const runId = body?.runId as string | undefined
      let currentContext: IAppContext = {
        configStore: {} as IAppContext['configStore'],
        contexts: {
          runContext: {} as IAppContext['contexts']['runContext'],
          characterContext: {} as IAppContext['contexts']['characterContext'],
          stashContext: {} as IAppContext['contexts']['stashContext'],
          shopContext: {} as IAppContext['contexts']['shopContext'],
        },
      }
      if (runId && typeof runId === 'string') {
        const executionContext = contextManager.getContextByRunId(runId)
        if (executionContext) {
          currentContext = executionContext
        }
      }
      return new AppContextHolder(currentContext)
    },
    inject: [ContextManager, REQUEST],
    scope: Scope.REQUEST,
  },
]
