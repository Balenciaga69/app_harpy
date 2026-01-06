import { Module } from '@nestjs/common'
import { EquipmentService } from 'src/from-game-core'
import { equipmentFeatureProviders } from '../../providers/equipment-feature.providers'
import { contextConverterProviders } from '../../providers/context-converter.providers'
import { fineGrainedInterfaceProviders } from '../../providers/fine-grained-interface.providers'
import { configStoreProviders } from '../../providers/config-store.providers'
import { EquipmentController } from './equipment.controller'
import { EquipmentNestService } from './equipment.service'

/**
 * 裝備模組
 * 職責：管理裝備相關功能
 */
@Module({
  controllers: [EquipmentController],
  providers: [
    ...configStoreProviders,
    ...fineGrainedInterfaceProviders,
    ...contextConverterProviders,
    ...equipmentFeatureProviders,
    EquipmentNestService,
  ],
  exports: [EquipmentNestService, EquipmentService],
})
export class EquipmentModule {}
