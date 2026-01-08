import { Scope } from '@nestjs/common'
import {
  EquipmentContextHandler,
  EquipmentService,
  ContextToDomainConverter,
  ContextUnitOfWork,
  IContextSnapshotAccessor,
} from 'src/from-game-core'
/**
 * 裝備功能提供者
 * 職責：裝備相關的上下文處理和業務邏輯
 *
 * 層級：features/run/equipment（功能模組特定邏輯）
 * 原因：這些是 Equipment 模組專有的業務流程
 */
export const equipmentFeatureProviders = [
  {
    provide: EquipmentContextHandler,
    useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new EquipmentContextHandler(snapshot, converter, uow)
    },
    inject: ['IContextSnapshotAccessor', ContextToDomainConverter, ContextUnitOfWork],
    scope: Scope.REQUEST,
  },
  {
    provide: EquipmentService,
    useFactory: (handler: EquipmentContextHandler) => {
      return new EquipmentService(handler)
    },
    inject: [EquipmentContextHandler],
    scope: Scope.REQUEST,
  },
]
