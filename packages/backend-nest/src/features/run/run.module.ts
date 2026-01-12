import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'
import { InjectionTokens } from '../../infra/providers/injection-tokens'
import { AuthModule } from '../auth/auth.module'
import { SharedAppModule } from '../shared/shared-app.module'
import { RunOptionsService } from './app/run-options.service'
import { RunService } from './app/run.service'
import { UserMigrationService } from './app/user-migration.service'
import { IsOwnRunGuard } from './infra/is-own-run.guard'
import { RedisRunRepository } from './infra/redis-run-repository'
import { RunController } from './infra/run.controller'
import { runFeatureProviders } from './providers/run.providers'
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
    RunService,
    UserMigrationService,
    ...runFeatureProviders,
  ],
  exports: [InjectionTokens.RunRepository, IsOwnRunGuard, RunService, UserMigrationService],
})
export class RunModule {}
