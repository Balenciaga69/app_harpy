import { AffixTemplate } from '../../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../../domain/entity/Enemy'
import { RelicTemplate } from '../../../../domain/item/ItemTemplate'
import { ItemRollConfig } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../../domain/item/roll/ItemRollConstraint'
import { ProfessionTemplate } from '../../../../domain/profession/ProfessionTemplate'
import { UltimateTemplate } from '../../../../domain/ultimate/UltimateTemplate'
/** 詞綴配置資料傳輸物件 */
export interface AffixConfigDTO {
  affixTemplates: AffixTemplate[]
  affixEffectTemplates: AffixEffectTemplate[]
}
/** 詞綴配置加載器介面 */
export interface IAffixConfigLoader {
  /** 加載詞綴配置 */
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
