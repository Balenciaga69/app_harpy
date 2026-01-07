import { Module } from '@nestjs/common'
import { EquipmentService } from 'src/from-game-core'
import { sharedProviders } from '../../providers/common-context-package'
import { equipmentFeatureProviders } from '../../providers/equipment-feature.providers'
import { EquipmentController } from './equipment.controller'
import { EquipmentNestService } from './equipment.service'
/**
 * 裝備模組
 * 職責：管理裝備相關功能
 */
@Module({
  controllers: [EquipmentController],
  providers: [...sharedProviders, ...equipmentFeatureProviders, EquipmentNestService],
  exports: [EquipmentNestService, EquipmentService],
})
export class EquipmentModule {}
