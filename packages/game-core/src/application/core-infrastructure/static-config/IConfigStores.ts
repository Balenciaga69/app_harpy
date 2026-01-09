import { AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/Item'
import { ItemRollConfig, RewardRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { CombatRewardType } from '../../../domain/post-combat/PostCombat'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { ShopConfig } from '../../../domain/shop/ShopConfig'
import { UltimateTemplate } from '../../../domain/ultimate/Ultimate'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
export interface IEnemyStore {
  getEnemy(id: string): EnemyTemplate
  hasEnemy(id: string): boolean
  getEnemySpawnInfo(id: string): EnemySpawnInfo
  hasEnemySpawnInfo(id: string): boolean
  getEnemySpawnInfosByChapter(chapter: ChapterLevel): EnemySpawnInfo[]
  getAllEnemySpawnInfos(): EnemySpawnInfo[]
  setMany(enemies: EnemyTemplate[]): void
  setEnemySpawnInfos(infos: EnemySpawnInfo[]): void
}
export type ItemRollConfigId = 'SHOP_REFRESH' | 'POST_COMBAT_REWARD'
export interface IItemStore {
  getAllItemRollConstraints(): ItemRollConstraint[]
  getItemRollConstraint(id: string): ItemRollConstraint
  hasItemRollConstraint(id: string): boolean
  getItemRollConfig(id: ItemRollConfigId): ItemRollConfig
  hasItemRollConfig(id: ItemRollConfigId): boolean
  getRewardRollConfig(rewardType: CombatRewardType): RewardRollConfig | undefined
  getRelic(id: string): RelicTemplate
  hasRelic(id: string): boolean
  getManyItems(ids: string[]): ItemTemplate[]
  getAllItems(): ItemTemplate[]
  getManyRelics(ids: string[]): RelicTemplate[]
  getAllRelics(): RelicTemplate[]
  setMany(relics: RelicTemplate[]): void
  setItemRollConfigs(configs: ItemRollConfig[]): void
  setRewardRollConfigs(configs: RewardRollConfig[]): void
}
export interface IAffixStore {
  getAffix(id: string): AffixTemplate
  getAffixes(ids: string[]): AffixTemplate[]
  hasAffix(id: string): boolean
  getAffixEffect(id: string): AffixEffect
  getAffixEffects(ids: string[]): AffixEffect[]
  hasAffixEffect(id: string): boolean
  setMany(affixes: AffixTemplate[]): void
  setAffixEffects(effects: AffixEffect[]): void
}
export interface IUltimateStore {
  getUltimate(id: string): UltimateTemplate
  getUltimates(ids: string[]): UltimateTemplate[]
  hasUltimate(id: string): boolean
  setMany(ultimates: UltimateTemplate[]): void
}
export interface IProfessionStore {
  getProfession(id: string): ProfessionTemplate
  hasProfession(id: string): boolean
  getAllProfessions(): ProfessionTemplate[]
  setMany(professions: ProfessionTemplate[]): void
}
export type ShopConfigId = 'DEFAULT' | 'PREMIUM'
export interface IShopStore {
  getShopConfig(id: ShopConfigId): ShopConfig
  hasShopConfig(id: ShopConfigId): boolean
  getAllShopConfigs(): ShopConfig[]
  setMany(shopConfigs: ShopConfig[]): void
}
