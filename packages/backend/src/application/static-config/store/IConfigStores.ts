import { AffixTemplate } from '../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/ItemTemplate'
import { ItemRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { UltimateTemplate } from '../../../domain/ultimate/UltimateTemplate'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

export interface IEnemyStore {
  getEnemy(id: string): EnemyTemplate | undefined
  hasEnemy(id: string): boolean
  getEnemySpawnInfo(id: string): EnemySpawnInfo | undefined
  hasEnemySpawnInfo(id: string): boolean
  getEnemySpawnInfosByChapter(chapter: ChapterLevel): EnemySpawnInfo[]
  getAllEnemySpawnInfos(): EnemySpawnInfo[]
  setMany(enemies: EnemyTemplate[]): void
  setEnemySpawnInfos(infos: EnemySpawnInfo[]): void
}
export interface IItemStore {
  getAllItemRollConstraints(): ItemRollConstraint[]
  getItemRollConstraint(id: string): ItemRollConstraint | undefined
  hasItemRollConstraint(id: string): boolean
  getItemRollConfig(id: string): ItemRollConfig | undefined
  hasItemRollConfig(id: string): boolean
  getRelic(id: string): RelicTemplate | undefined
  hasRelic(id: string): boolean
  getManyItems(ids: string[]): ItemTemplate[]
  getAllItems(): ItemTemplate[]
  getManyRelics(ids: string[]): RelicTemplate[]
  getAllRelics(): RelicTemplate[]
  setMany(relics: RelicTemplate[]): void
  setItemRollConfigs(configs: ItemRollConfig[]): void
}
export interface IAffixStore {
  getAffix(id: string): AffixTemplate | undefined
  hasAffix(id: string): boolean
  getAffixEffect(id: string): AffixEffectTemplate | undefined
  hasAffixEffect(id: string): boolean
  setMany(affixes: AffixTemplate[]): void
  setAffixEffects(effects: AffixEffectTemplate[]): void
}
export interface IUltimateStore {
  getUltimate(id: string): UltimateTemplate | undefined
  hasUltimate(id: string): boolean
  setMany(ultimates: UltimateTemplate[]): void
}
