import { Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import {
  ConfigStoreAccessorImpl,
  ContextMutatorImpl,
  ContextSnapshotAccessorImpl,
  IAppContext,
} from 'src/from-game-core'
import { ContextManager } from '../context/ContextManager'

export const fineGrainedInterfaceProviders = [
  {
    provide: 'IAppContext',
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
      return currentContext
    },
    inject: [ContextManager, REQUEST],
    scope: Scope.REQUEST,
  },
  {
    provide: 'IConfigStoreAccessor',
    useFactory: (context: IAppContext) => {
      return new ConfigStoreAccessorImpl(context)
    },
    inject: ['IAppContext'],
    scope: Scope.REQUEST,
  },
  {
    provide: 'IContextSnapshotAccessor',
    useFactory: (context: IAppContext) => {
      return new ContextSnapshotAccessorImpl(context)
    },
    inject: ['IAppContext'],
    scope: Scope.REQUEST,
  },
  {
    provide: 'IContextMutator',
    useFactory: (context: IAppContext, contextManager: ContextManager, request: any) => {
      const onContextChange = (next: IAppContext) => {
        const body = request.body as Record<string, any>
        const runId = body?.runId as string | undefined
        if (runId && typeof runId === 'string') {
          contextManager.saveContext(next)
        }
      }
      return new ContextMutatorImpl(onContextChange, context)
    },
    inject: ['IAppContext', ContextManager, REQUEST],
    scope: Scope.REQUEST,
  },
]
