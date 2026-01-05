import { Module } from '@nestjs/common'
import { RunController } from './controllers/run.controller'
import { RunService } from './services/run.service'
import { ConfigService } from './services/config.service'
import { RunApplicationService } from './services/run-application.service'
import { ShopServiceWrapper } from './services/shop-service.wrapper'
import { AppContextRepository } from '../../infra/repositories/AppContextRepository'
import { AppContextUnitOfWorkFactory } from '../../infra/services/AppContextUnitOfWorkFactory'
import { ShopService } from '../../from-game-core'
@Module({
  controllers: [RunController],
  providers: [
    ConfigService,
    AppContextRepository,
    AppContextUnitOfWorkFactory,
    RunApplicationService,
    RunService,
    {
      provide: ShopService,
      useClass: ShopService,
    },
    ShopServiceWrapper,
  ],
  exports: [ConfigService, RunApplicationService, AppContextRepository],
})
export class RunModule {}
