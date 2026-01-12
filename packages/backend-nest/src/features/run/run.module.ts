import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'
import { AuthModule } from '../auth/auth.module'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { SharedAppModule } from '../shared/shared-app.module'
import { IsOwnRunGuard } from './is-own-run.guard'
import { RedisRunRepository } from './repository/redis-run-repository'
import { RunController } from './run.controller'
import { runFeatureProviders } from './run.providers'
import { RunApiService } from './service/run-api.service'
import { RunOptionsService } from './service/run-options.service'
import { UserMigrationService } from './service/user-migration.service'
@Module({
  imports: [SharedAppModule, AuthModule],
  controllers: [RunController],
  providers: [
    {
      provide: InjectionTokens.RunRepository,
      useFactory: (redis: Redis) => new RedisRunRepository(redis),
      inject: [InjectionTokens.RedisClient],
    },
    IsOwnRunGuard,
    RunOptionsService,
    RunApiService,
    UserMigrationService,
    ...runFeatureProviders,
  ],
  exports: [InjectionTokens.RunRepository, IsOwnRunGuard, RunApiService, UserMigrationService],
})
export class RunModule {}
