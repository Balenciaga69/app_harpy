import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { EquipmentModule } from '../equipment/equipment.module'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { SharedAppModule } from '../shared/shared-app.module'
import { SharedInfraModule } from '../shared/shared-infra.module'
import { ShopModule } from '../shop/shop.module'
import { IsOwnRunGuard } from './is-own-run.guard'
import { RedisRunRepository } from './repository/redis-run.repository'
import { RunController } from './run.controller'
import { runFeatureProviders } from './run.providers'
import { RunApiService } from './service/run-api.service'
import { RunOptionsService } from './service/run-options.service'

@Module({
  imports: [SharedAppModule, SharedInfraModule, AuthModule, ShopModule, EquipmentModule],
  controllers: [RunController],
  providers: [
    {
      provide: InjectionTokens.RunRepository,
      useClass: RedisRunRepository,
    },
    IsOwnRunGuard,
    RunOptionsService,
    RunApiService,
    ...runFeatureProviders,
  ],
  exports: [InjectionTokens.RunRepository, IsOwnRunGuard, RunApiService],
})
export class RunModule {}
