import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  IContextSnapshotAccessor,
  ItemGenerationService,
  ShopContextHandler,
  ShopService,
} from 'src/from-game-core'
import { InjectionTokens } from '../../infra/providers/injection-tokens'
export const shopFeatureProviders = [
  {
    provide: ShopContextHandler,
    useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new ShopContextHandler(snapshot, converter, uow)
    },
    inject: [InjectionTokens.ContextSnapshotAccessor, ContextToDomainConverter, ContextUnitOfWork],
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
