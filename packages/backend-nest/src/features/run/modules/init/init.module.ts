import { Module } from '@nestjs/common'
import { GameStartOptionsService, RunInitializationService } from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'
import { InitController } from './init.controller'
import { InitService } from './init.service'
import { configStoreProviders } from '../../providers/config-store.providers'
/**
 * 初始化模組
 * 職責：管理遊戲進度初始化相關的功能
 */
@Module({
  controllers: [InitController],
  providers: [ContextManager, ...configStoreProviders, GameStartOptionsService, RunInitializationService, InitService],
  exports: [InitService],
})
export class InitModule {}
