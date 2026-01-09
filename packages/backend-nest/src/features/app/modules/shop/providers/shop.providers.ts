import { Scope } from '@nestjs/common'
import {
  AppContextHolder,
  ContextToDomainConverter,
  ContextUnitOfWork,
  IContextSnapshotAccessor,
  ItemGenerationService,
  ShopContextHandler,
  ShopService,
} from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'

export const shopFeatureProviders = [
  {
    provide: ShopContextHandler,
    useFactory: (
      snapshot: IContextSnapshotAccessor,
      converter: ContextToDomainConverter,
      uow: ContextUnitOfWork,
      holder: AppContextHolder,
      ctxManager: ContextManager
    ) => {
      return new ShopContextHandler(snapshot, converter, uow, holder, ctxManager)
    },
    inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork, AppContextHolder, ContextManager],
    scope: Scope.REQUEST,
  },
  {
    provide: ShopService,
    useFactory: (itemGenSvc: ItemGenerationService, shopHandler: ShopContextHandler) => {
      return new ShopService(itemGenSvc, shopHandler)
    },
    inject: [ItemGenerationService, ShopContextHandler],
    scope: Scope.REQUEST,
  },
]
