import { Scope } from '@nestjs/common'
import {
  ContextToDomainConverter,
  ContextUnitOfWork,
  EquipmentContextHandler,
  EquipmentService as GameCoreEquipmentService,
  IContextSnapshotAccessor,
} from 'src/from-xo-c'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { EquipmentService } from './equipment.service'
export const equipmentFeatureProviders = [
  {
    provide: EquipmentContextHandler,
    useFactory: (snapshot: IContextSnapshotAccessor, converter: ContextToDomainConverter, uow: ContextUnitOfWork) => {
      return new EquipmentContextHandler(snapshot, converter, uow)
    },
    inject: [InjectionTokens.ContextSnapshotAccessor, ContextToDomainConverter, ContextUnitOfWork],
    scope: Scope.REQUEST,
  },
  {
    provide: GameCoreEquipmentService,
    useFactory: (handler: EquipmentContextHandler) => {
      return new GameCoreEquipmentService(handler)
    },
    inject: [EquipmentContextHandler],
    scope: Scope.REQUEST,
  },
  {
    provide: EquipmentService,
    useFactory: (gameCoreService: GameCoreEquipmentService) => {
      return new EquipmentService(gameCoreService)
    },
    inject: [GameCoreEquipmentService],
    scope: Scope.REQUEST,
  },
]
