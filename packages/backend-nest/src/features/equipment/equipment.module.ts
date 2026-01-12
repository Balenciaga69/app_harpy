import { Module } from '@nestjs/common'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { SharedInfraModule } from 'src/features/shared/shared-infra.module'
import { EquipmentController } from './equipment.controller'
import { equipmentFeatureProviders } from './equipment.providers'
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [EquipmentController],
  providers: [...equipmentFeatureProviders],
  exports: [...equipmentFeatureProviders],
})
export class EquipmentModule {}
