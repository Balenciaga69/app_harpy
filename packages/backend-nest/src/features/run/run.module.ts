import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from './application/shared-app.module'
import { EquipmentModule } from './modules/equipment/equipment.module'
import { InitModule } from './modules/init/init.module'
import { ShopModule } from './modules/shop/shop.module'
/**
 * 遊戲進度模組
 * 職責：協調遊戲進度相關的所有功能
 *
 * 依賴層級：
 * RunModule
 *   ├─ imports: SharedInfraModule (infra 層)
 *   ├─ imports: SharedAppModule (app 層)
 *   └─ imports: 功能模組 (Init, Shop, Equipment)
 *
 * 說明：
 * - SharedInfraModule: 提供基礎設施（上下文管理、配置、介面適配）
 * - SharedAppModule: 提供應用層服務（實體、轉換、生成）
 * - 避免循環依賴：所有子模組只依賴上游模組
 */
@Module({
  imports: [SharedInfraModule, SharedAppModule, InitModule, ShopModule, EquipmentModule],
})
export class RunModule {}
