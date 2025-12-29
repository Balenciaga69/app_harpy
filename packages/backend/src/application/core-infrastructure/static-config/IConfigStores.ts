import { AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/Item'
import { ItemRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { UltimateTemplate } from '../../../domain/ultimate/Ultimate'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
/** 敵人配置存儲介面：支援敵人樣板與生成資訊的查詢 */
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
/** 物品配置存儲介面：支援聖物樣板、骰選配置與約束條件的查詢 */
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
/** Affix配置存儲介面：支援Affix樣板與效果樣板的查詢 */
export interface IAffixStore {
  getAffix(id: string): AffixTemplate | undefined
  getAffixes(ids: string[]): AffixTemplate[]
  hasAffix(id: string): boolean
  getAffixEffect(id: string): AffixEffect | undefined
  getAffixEffects(ids: string[]): AffixEffect[]
  hasAffixEffect(id: string): boolean
  setMany(affixes: AffixTemplate[]): void
  setAffixEffects(effects: AffixEffect[]): void
}
/** 大絕招配置存儲介面：支援大絕招樣板的查詢 */
export interface IUltimateStore {
  getUltimate(id: string): UltimateTemplate | undefined
  getUltimates(ids: string[]): UltimateTemplate[]
  hasUltimate(id: string): boolean
  setMany(ultimates: UltimateTemplate[]): void
}
/** 職業配置存儲介面：支援職業樣板的查詢 */
export interface IProfessionStore {
  getProfession(id: string): ProfessionTemplate | undefined
  hasProfession(id: string): boolean
  getAllProfessions(): ProfessionTemplate[]
  setMany(professions: ProfessionTemplate[]): void
}
