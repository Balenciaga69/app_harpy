import { Module } from '@nestjs/common'
import { Redis } from 'ioredis'

import { AuthModule } from '../auth/auth.module'
import { IsOwnRunGuard } from './infra/is-own-run.guard'
import { RedisRunRepository } from './infra/redis-run-repository'
@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: 'IRunRepository',
      useFactory: (redis: Redis) => new RedisRunRepository(redis),
      inject: ['REDIS_CLIENT'],
    },
    IsOwnRunGuard,
  ],
  exports: ['IRunRepository', IsOwnRunGuard],
})
export class RunModule {}
