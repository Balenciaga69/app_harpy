import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  IContextSnapshotAccessor,
  ItemGenerationService,
  ShopContextHandler,
  ShopService,
} from 'src/from-game-core'
/**
 * 商店功能提供者
 * 負責商店相關的上下文處理和業務邏輯
 */
export const shopFeatureProviders = [
  {
    provide: ShopContextHandler,
    useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new ShopContextHandler(snapshot, converter, uow)
    },
    inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
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
