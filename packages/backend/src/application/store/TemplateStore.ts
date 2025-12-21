import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { ItemRollConstraint } from '../../domain/item/roll/ItemRollConstraint'
import { EquipmentTemplate, RelicTemplate } from '../../domain/item/ItemTemplate'
import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'
import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
import { IEnemyConfigLoader } from './IEnemyConfigLoader'
import { ItemRollConfig } from '../../domain/item/roll/ItemRollConfig'
export class TemplateStore {
  // enemy
  enemies: Map<string, EnemyTemplate> = new Map()
  enemySpawnInfos: Map<string, EnemySpawnInfo> = new Map()
  // item
  itemRollConstraints: Map<string, ItemRollConstraint> = new Map()
  itemRollConfigs: Map<string, ItemRollConfig> = new Map()
  equipments: Map<string, EquipmentTemplate> = new Map()
  relics: Map<string, RelicTemplate> = new Map()
  // affix & ultimate
  affixes: Map<string, AffixTemplate> = new Map()
  affixEffects: Map<string, AffixEffectTemplate> = new Map()
  ultimates: Map<string, UltimateTemplate> = new Map()
  // Loaders
  private enemyConfigLoader: IEnemyConfigLoader
  private isLoaded: boolean = false //TODO: 載入限制尚未被採用
  // ctor
  constructor(enemyConfigLoader: IEnemyConfigLoader) {
    this.enemyConfigLoader = enemyConfigLoader
  }
  async initialize() {
    await this.loadEnemyTemplates()
    this.isLoaded = true
  }
  // === Loaders ===
  async loadEnemyTemplates() {
    const { configs, spawnInfos: spawnInfo } = await this.enemyConfigLoader.load()
    configs.forEach((config) => {
      this.enemies.set(config.enemyTemplate.id, config.enemyTemplate)
      config.affixTemplates.forEach((affix) => this.affixes.set(affix.id, affix))
      config.affixEffects.forEach((effect) => this.affixEffects.set(effect.id, effect))
      this.ultimates.set(config.ultimateTemplate.id, config.ultimateTemplate)
    })
    spawnInfo.forEach((info) => this.enemySpawnInfos.set(info.templateId, info))
  }
  // === Enemy ===
  getEnemy(id: string): EnemyTemplate | undefined {
    return this.enemies.get(id)
  }
  hasEnemy(id: string): boolean {
    return this.enemies.has(id)
  }
  // === Enemy Spawn Info ===
  getEnemySpawnInfo(id: string): EnemySpawnInfo | undefined {
    return this.enemySpawnInfos.get(id)
  }
  hasEnemySpawnInfo(id: string): boolean {
    return this.enemySpawnInfos.has(id)
  }
  getEnemySpawnInfosByChapter(chapter: ChapterLevel): EnemySpawnInfo[] {
    return Array.from(this.enemySpawnInfos.values()).filter((info) => info.chapters.includes(chapter))
  }
  getAllEnemySpawnInfos(): EnemySpawnInfo[] {
    return Array.from(this.enemySpawnInfos.values())
  }
  // === Item Roll Constraint ===
  getAllItemRollConstraints(): ItemRollConstraint[] {
    return Array.from(this.itemRollConstraints.values())
  }
  getItemRollConstraint(id: string): ItemRollConstraint | undefined {
    return this.itemRollConstraints.get(id)
  }
  hasItemRollConstraint(id: string): boolean {
    return this.itemRollConstraints.has(id)
  }
  // === Item Roll Config ===
  getItemRollConfig(id: string): ItemRollConfig | undefined {
    return this.itemRollConfigs.get(id)
  }
  hasItemRollConfig(id: string): boolean {
    return this.itemRollConfigs.has(id)
  }
  // === Affix ===
  getAffix(id: string): AffixTemplate | undefined {
    return this.affixes.get(id)
  }
  hasAffix(id: string): boolean {
    return this.affixes.has(id)
  }
  // === Affix Effect ===
  getAffixEffect(id: string): AffixEffectTemplate | undefined {
    return this.affixEffects.get(id)
  }
  hasAffixEffect(id: string): boolean {
    return this.affixEffects.has(id)
  }
  // === Ultimate ===
  getUltimate(id: string): UltimateTemplate | undefined {
    return this.ultimates.get(id)
  }
  hasUltimate(id: string): boolean {
    return this.ultimates.has(id)
  }
  // === Item ===
  getEquipment(id: string): EquipmentTemplate | undefined {
    return this.equipments.get(id)
  }
  hasEquipment(id: string): boolean {
    return this.equipments.has(id)
  }
  // === Relic ===
  getRelic(id: string): RelicTemplate | undefined {
    return this.relics.get(id)
  }
  hasRelic(id: string): boolean {
    return this.relics.has(id)
  }
}
