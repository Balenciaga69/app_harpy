import { Module } from '@nestjs/common';
import { RunController } from './run.controller';
import { RunService } from './run.service';
import { ConfigService } from './config.service';
import { InMemoryContextRepository } from '../infra/InMemoryContextRepository';

/**
 * Run 模組：整合 Run 相關的 Controller、Service、Repository
 */
@Module({
  controllers: [RunController],
  providers: [RunService, ConfigService, InMemoryContextRepository],
  exports: [InMemoryContextRepository],
})
export class RunModule {}
