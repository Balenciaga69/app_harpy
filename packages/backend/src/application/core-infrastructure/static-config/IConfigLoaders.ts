import { AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { RelicTemplate } from '../../../domain/item/Item'
import { ItemRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { ShopConfig } from '../../../domain/shop/ShopConfig'
import { UltimateTemplate } from '../../../domain/ultimate/Ultimate'
/** Affix配置資料傳輸物件 */
export interface AffixConfigDTO {
  affixTemplates: AffixTemplate[]
  affixEffectTemplates: AffixEffect[]
}
/** Affix配置加載器介面 */
export interface IAffixConfigLoader {
  /** 加載Affix配置 */
  load(): Promise<AffixConfigDTO>
}
/** 敵人配置資料傳輸物件 */
export interface EnemyConfigDTO {
  enemyTemplates: EnemyTemplate[]
  spawnInfos: EnemySpawnInfo[]
}
/** 敵人配置加載器介面 */
export interface IEnemyConfigLoader {
  /** 加載敵人配置 */
  load(): Promise<EnemyConfigDTO>
}
/** 物品配置資料傳輸物件 */
export interface ItemConfigDTO {
  relicTemplate: RelicTemplate[]
  itemRollConfigs: ItemRollConfig[]
  itemRollConstraints: ItemRollConstraint[]
}
/** 物品配置加載器介面 */
export interface IItemConfigLoader {
  /** 加載物品配置 */
  load(): Promise<ItemConfigDTO>
}
/** 職業配置資料傳輸物件 */
export interface ProfessionConfigDTO {
  professionTemplates: ProfessionTemplate[]
}
/** 職業配置加載器介面 */
export interface IProfessionConfigLoader {
  /** 加載職業配置 */
  load(): Promise<ProfessionConfigDTO>
}
/** 大絕招配置資料傳輸物件 */
export interface UltimateConfigDTO {
  ultimateTemplates: UltimateTemplate[]
}
/** 大絕招配置加載器介面 */
export interface IUltimateConfigLoader {
  /** 加載大絕招配置 */
  load(): Promise<UltimateConfigDTO>
}
/** 商店配置資料傳輸物件 */
export interface ShopConfigDTO {
  shopConfigs: ShopConfig[]
}
/** 商店配置加載器介面 */
export interface IShopConfigLoader {
  /** 加載商店配置 */
  load(): Promise<ShopConfigDTO>
}
