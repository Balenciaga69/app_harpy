import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RunService } from './app/RunService'
import { UserMigrationService } from './app/UserMigrationService'
import { RedisRunRepository } from './infra/RedisRunRepository'
import { IsOwnRunGuard } from './infra/IsOwnRunGuard'
import { AuthModule } from '../auth/auth.module'
@Module({
  imports: [AuthModule],
  providers: [
    RunService,
    UserMigrationService,
    {
      provide: 'IRunRepository',
      useFactory: (redis: Redis) => new RedisRunRepository(redis),
      inject: ['REDIS_CLIENT'],
    },
    IsOwnRunGuard,
  ],
  exports: [RunService, UserMigrationService, 'IRunRepository', IsOwnRunGuard],
})
export class RunModule {}
