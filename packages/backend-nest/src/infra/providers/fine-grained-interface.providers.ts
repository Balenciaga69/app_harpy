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
export const fineGrainedInterfaceProviders = [
  {
    provide: AppContextHolder,
    useFactory: (contextManager: ContextManager, request: any) => {
      const body = request.body as Record<string, any>
      const runId = body?.runId as string | undefined
      let currentContext: IAppContext | undefined
      if (runId && typeof runId === 'string') {
        const persistedContext = contextManager.getContextByRunId(runId)
        if (persistedContext) {
          currentContext = persistedContext
        }
      }
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
