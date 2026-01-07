import { Scope } from '@nestjs/common'
import {
  AppContextHolder,
  ConfigStoreAccessorImpl,
  ContextSnapshotAccessorImpl,
  ContextMutatorImpl,
  IAppContext,
} from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'
/**
 * 細粒度介面提供者
 * 提供由 game-core 定義的細粒度介面實現
 */
export const fineGrainedInterfaceProviders = [
  ContextManager,
  {
    provide: 'IConfigStoreAccessor',
    useFactory: (holder: AppContextHolder) => {
      return new ConfigStoreAccessorImpl(holder)
    },
    inject: [AppContextHolder],
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
  {
    provide: AppContextHolder,
    useFactory: (contextManager: ContextManager) => {
      const initialContext: IAppContext = {
        configStore: {} as IAppContext['configStore'],
        contexts: {
          runContext: {} as IAppContext['contexts']['runContext'],
          characterContext: {} as IAppContext['contexts']['characterContext'],
          stashContext: {} as IAppContext['contexts']['stashContext'],
          shopContext: {} as IAppContext['contexts']['shopContext'],
        },
      }
      const currentContext = contextManager.getContext() ?? initialContext
      return new AppContextHolder(currentContext)
    },
    inject: [ContextManager],
    scope: Scope.REQUEST,
  },
]
