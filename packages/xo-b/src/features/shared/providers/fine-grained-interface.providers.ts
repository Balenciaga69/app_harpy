import { Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { ConfigStoreAccessorImpl, ContextMutatorImpl, ContextSnapshotAccessorImpl, IAppContext } from 'src/from-xo-c'
import { ContextManager } from '../context/context-manager'
import { getRunIdFromRequest } from '../helpers/request-utils'
import { InjectionTokens } from './injection-tokens'
export const fineGrainedInterfaceProviders = [
  {
    provide: InjectionTokens.AppContext,
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
    provide: InjectionTokens.ConfigStoreAccessor,
    useFactory: (context: IAppContext) => {
      return new ConfigStoreAccessorImpl(context)
    },
    inject: [InjectionTokens.AppContext],
    scope: Scope.REQUEST,
  },
  {
    provide: InjectionTokens.ContextSnapshotAccessor,
    useFactory: (context: IAppContext) => {
      return new ContextSnapshotAccessorImpl(context)
    },
    inject: [InjectionTokens.AppContext],
    scope: Scope.REQUEST,
  },
  {
    provide: InjectionTokens.ContextMutator,
    useFactory: (context: IAppContext, contextManager: ContextManager, request: Request) => {
      const onContextChange = async (next: IAppContext) => {
        const runId = getRunIdFromRequest(request)
        if (runId && typeof runId === 'string') {
          await contextManager.saveContext(next)
        }
      }
      return new ContextMutatorImpl(onContextChange, context)
    },
    inject: [InjectionTokens.AppContext, ContextManager, REQUEST],
    scope: Scope.REQUEST,
  },
]
