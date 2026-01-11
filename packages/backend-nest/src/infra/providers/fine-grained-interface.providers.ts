import { Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'
import {
  ConfigStoreAccessorImpl,
  ContextMutatorImpl,
  ContextSnapshotAccessorImpl,
  IAppContext,
} from 'src/from-game-core'

import { ContextManager } from '../context/context-manager'
import { getRunIdFromRequest } from '../helpers/request-utils'
export const fineGrainedInterfaceProviders = [
  {
    provide: 'IAppContext',
    useFactory: async (contextManager: ContextManager, request: Request) => {
      const runId = getRunIdFromRequest(request)
      let currentContext: IAppContext | undefined
      if (runId && typeof runId === 'string') {
        const persistedContext = await contextManager.getContextByRunId(runId)
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
    useFactory: (context: IAppContext, contextManager: ContextManager, request: Request) => {
      const onContextChange = async (next: IAppContext) => {
        const runId = getRunIdFromRequest(request)
        if (runId && typeof runId === 'string') {
          await contextManager.saveContext(next)
        }
      }
      return new ContextMutatorImpl(onContextChange, context)
    },
    inject: ['IAppContext', ContextManager, REQUEST],
    scope: Scope.REQUEST,
  },
]
