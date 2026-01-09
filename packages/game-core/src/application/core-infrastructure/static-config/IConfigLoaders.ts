import { AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { RelicTemplate } from '../../../domain/item/Item'
import { ItemRollConfig, RewardRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { ShopConfig } from '../../../domain/shop/ShopConfig'
import { UltimateTemplate } from '../../../domain/ultimate/Ultimate'

export interface AffixConfigDTO {
  affixTemplates: AffixTemplate[]
  affixEffectTemplates: AffixEffect[]
}

export interface IAffixConfigLoader {
  load(): Promise<AffixConfigDTO>
}

export interface EnemyConfigDTO {
  enemyTemplates: EnemyTemplate[]
  spawnInfos: EnemySpawnInfo[]
}

export interface IEnemyConfigLoader {
  load(): Promise<EnemyConfigDTO>
}

export interface ItemConfigDTO {
  relicTemplate: RelicTemplate[]
  itemRollConfigs: ItemRollConfig[]
  itemRollConstraints: ItemRollConstraint[]
  rewardRollConfigs: RewardRollConfig[]
}

export interface IItemConfigLoader {
  load(): Promise<ItemConfigDTO>
}

export interface ProfessionConfigDTO {
  professionTemplates: ProfessionTemplate[]
}

export interface IProfessionConfigLoader {
  load(): Promise<ProfessionConfigDTO>
}

export interface UltimateConfigDTO {
  ultimateTemplates: UltimateTemplate[]
}

export interface IUltimateConfigLoader {
  load(): Promise<UltimateConfigDTO>
}

export interface ShopConfigDTO {
  shopConfigs: ShopConfig[]
}

export interface IShopConfigLoader {
  load(): Promise<ShopConfigDTO>
}
