import { Module, Scope } from '@nestjs/common'
import { RunController } from './controllers/run.controller'
import { RunService } from './services/run.service'
import { ConfigService } from './services/config.service'
import { RunApplicationService } from './services/run-application.service'
import { ShopServiceWrapper } from './services/shop-service.wrapper'
import { AppContextRepository } from '../../infra/repositories/AppContextRepository'
import { ShopService } from '../../from-game-core'
import { ContextUnitOfWorkAdapter } from '../../infra/services/ContextUnitOfWorkAdapter'
import { InMemoryContextRepository } from '../../infra/repositories/InMemoryContextRepository'
import { RunInitServiceWrapper } from './services/run-init-service.wrapper'
import { GameCoreItemGenerationServiceAdapter } from '../../infra/adapters/GameCoreItemGenerationServiceAdapter'
import { GameCoreShopContextHandlerAdapter } from '../../infra/adapters/GameCoreShopContextHandlerAdapter'

// 使用字串 token 作為 DI 容器的 key，因為 TS 介面在運行時不存在
const IItemGenerationService = 'IItemGenerationService'
const IShopContextHandler = 'IShopContextHandler'

@Module({
  controllers: [RunController],
  providers: [
    ConfigService,
    AppContextRepository,
    {
      provide: InMemoryContextRepository,
      useClass: InMemoryContextRepository,
      scope: Scope.TRANSIENT,
    },
    {
      provide: ContextUnitOfWorkAdapter,
      useClass: ContextUnitOfWorkAdapter,
      scope: Scope.TRANSIENT,
    },
    {
      provide: RunApplicationService,
      useClass: RunApplicationService,
      scope: Scope.TRANSIENT,
    },
    RunService,
    {
      provide: IItemGenerationService,
      useClass: GameCoreItemGenerationServiceAdapter,
      scope: Scope.TRANSIENT,
    },
    {
      provide: IShopContextHandler,
      useClass: GameCoreShopContextHandlerAdapter,
      scope: Scope.TRANSIENT,
    },
    {
      provide: ShopService,
      useFactory: (
        itemGenService: GameCoreItemGenerationServiceAdapter,
        shopCtxHandler: GameCoreShopContextHandlerAdapter
      ) => {
        return new ShopService(itemGenService, shopCtxHandler)
      },
      inject: [IItemGenerationService, IShopContextHandler],
      scope: Scope.TRANSIENT,
    },
    ShopServiceWrapper,
    RunInitServiceWrapper,
  ],
  exports: [ConfigService, RunApplicationService, AppContextRepository],
})
export class RunModule {}
