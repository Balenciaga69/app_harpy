/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { RunInitializationService } from '@app-harpy/game-core';
import { InMemoryContextRepository } from '../infra/InMemoryContextRepository';
import { InitRunDto } from './dto/InitRunDto';
import { ConfigService } from './config.service';

/**
 * Run 應用服務：協調 game-core 邏輯與後端基礎設施
 */
@Injectable()
export class RunService {
  constructor(
    private readonly contextRepo: InMemoryContextRepository,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 初始化新 Run
   * 流程：調用 game-core 的 RunInitializationService
   */
  async initializeRun(dto: InitRunDto) {
    const configStore = await this.configService.getConfigStore();

    const runInitService = new RunInitializationService(configStore, {
      batch: this.contextRepo,
    });

    const result = await runInitService.initialize({
      professionId: dto.professionId,
      seed: dto.seed,
      persist: true,
    });

    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '初始化 Run 失敗',
      });
    }

    return {
      success: true,
      data: {
        runId: result.value!.contexts.runContext.runId,
        professionId: result.value!.contexts.characterContext.professionId,
        seed: result.value!.contexts.runContext.seed,
      },
    };
  }
}
