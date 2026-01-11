import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { HealthController } from './app.controller'
import { EquipmentModule } from '../equipment/equipment.module'
import { InitModule } from '../init/init.module'
import { ShopModule } from '../shop/shop.module'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { AuthModule } from '../auth/auth.module'
import { RunModule } from '../run/run.module'
@Module({
  imports: [SharedInfraModule, SharedAppModule, AuthModule, RunModule, InitModule, ShopModule, EquipmentModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
