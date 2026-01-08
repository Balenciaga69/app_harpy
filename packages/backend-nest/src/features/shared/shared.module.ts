import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../app/shared/shared-app.module'
import { EquipmentModule } from '../app/modules/equipment/equipment.module'
import { InitModule } from '../app/modules/init/init.module'
import { ShopModule } from '../app/modules/shop/shop.module'
/**
 * 共享遊戲功能模組
 * 職責：協調遊戲進度相關的所有功能（初始化、商店、裝備）
 *
 * 結構：
 * SharedFeatureModule
 *   ├─ imports: SharedInfraModule (infra 層 - 全局基礎設施)
 *   ├─ imports: SharedAppModule (app 層 - 核心業務服務)
 *   └─ imports: 功能模組 (Init, Shop, Equipment)
 *
 * 設計理念：
 * - 扁平化結構，避免深層嵌套與 DDD 過度設計
 * - 所有功能模組共享 SharedInfraModule 和 SharedAppModule
 * - 功能模組完全獨立，無相互依賴
 */
@Module({
  imports: [SharedInfraModule, SharedAppModule, InitModule, ShopModule, EquipmentModule],
})
export class SharedFeatureModule {}
