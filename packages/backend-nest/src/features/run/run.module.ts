import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'
import { InjectionTokens } from '../shared/providers/injection-tokens'
import { SharedAppModule } from '../shared/shared-app.module'
import { SharedInfraModule } from '../shared/shared-infra.module'
import { IsOwnRunGuard } from './is-own-run.guard'
import { InMemoryRunRepository } from './repository/in-memory-run.repository'
import { RedisRunRepository } from './repository/redis-run.repository'
import { RunController } from './run.controller'
import { runFeatureProviders } from './run.providers'
import { RunApiService } from './service/run-api.service'
import { RunOptionsService } from './service/run-options.service'
import { UserMigrationService } from './service/user-migration.service'
@Module({
  imports: [SharedAppModule, SharedInfraModule, AuthModule],
  controllers: [RunController],
  providers: [
    {
      provide: InjectionTokens.RunRepository,
      useFactory: (configService: ConfigService, redis?: Redis) => {
        const storageType = configService.get<string>('STORAGE_TYPE', 'memory')
        if (storageType === 'memory') {
          return new InMemoryRunRepository()
        }
        if (!redis) {
          throw new Error('Redis client is not available. Please check your STORAGE_TYPE configuration.')
        }
        return new RedisRunRepository(redis)
      },
      inject: [ConfigService, { token: InjectionTokens.RedisClient, optional: true }],
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
