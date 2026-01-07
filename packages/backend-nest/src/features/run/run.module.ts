import { Module } from '@nestjs/common'
// 子模組導入
import { EquipmentModule } from './modules/equipment/equipment.module'
import { InitModule } from './modules/init/init.module'
import { ShopModule } from './modules/shop/shop.module'
// Provider 導入
@Module({
  imports: [InitModule, ShopModule, EquipmentModule],
})
export class RunModule {}
