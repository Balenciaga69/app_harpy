import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { equipmentFeatureProviders } from './equipment.providers'
import { EquipmentController } from './equipment.controller'
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [EquipmentController],
  providers: [...equipmentFeatureProviders],
  exports: [...equipmentFeatureProviders],
})
export class EquipmentModule {}
