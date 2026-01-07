import { Module } from '@nestjs/common'
import { GameStartOptionsService, RunInitializationService } from 'src/from-game-core'
import { ContextManager } from 'src/infra/context/ContextManager'
import { sharedProviders } from '../../providers/common-context-package'
import { InitController } from './init.controller'
import { InitService } from './init.service'
/**
 * 初始化模組
 * 職責：管理遊戲進度初始化相關的功能
 */
@Module({
  controllers: [InitController],
  providers: [ContextManager, GameStartOptionsService, RunInitializationService, InitService, ...sharedProviders],
  exports: [InitService],
})
export class InitModule {}
