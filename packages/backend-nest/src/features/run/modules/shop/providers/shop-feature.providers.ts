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
 * 職責：商店相關的上下文處理和業務邏輯
 *
 * 層級：features/run/shop（功能模組特定邏輯）
 * 原因：這些是 Shop 模組專有的業務流程
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
