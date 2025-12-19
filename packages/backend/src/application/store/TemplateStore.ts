import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffect } from '../../domain/affix/effect/AffixEffect'
import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { EquipmentTemplate, RelicTemplate } from '../../domain/item/ItemTemplate'
import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'
import { ChapterLevel } from '../../shared/models/SpawnInfo'
import { IEnemyConfigLoader } from './IEnemyConfigLoader'

export class TemplateStore {
  // Maps
  enemies: Map<string, EnemyTemplate> = new Map()
  enemySpawnInfos: Map<string, EnemySpawnInfo> = new Map()
  affixes: Map<string, AffixTemplate> = new Map()
  affixEffects: Map<string, AffixEffect> = new Map()
  ultimates: Map<string, UltimateTemplate> = new Map()
  equipments: Map<string, EquipmentTemplate> = new Map()
  relics: Map<string, RelicTemplate> = new Map()
  // Loaders
  private enemyConfigLoader: IEnemyConfigLoader
  private isLoaded: boolean = false
  // ctor
  constructor(enemyConfigLoader: IEnemyConfigLoader) {
    this.enemyConfigLoader = enemyConfigLoader
  }

  async initialize() {
    await this.loadEnemyTemplates()
    this.isLoaded = true
  }

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

  getEnemy(id: string): EnemyTemplate | undefined {
    return this.enemies.get(id)
  }
  hasEnemy(id: string): boolean {
    return this.enemies.has(id)
  }

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

  getAffix(id: string): AffixTemplate | undefined {
    return this.affixes.get(id)
  }
  hasAffix(id: string): boolean {
    return this.affixes.has(id)
  }

  getAffixEffect(id: string): AffixEffect | undefined {
    return this.affixEffects.get(id)
  }
  hasAffixEffect(id: string): boolean {
    return this.affixEffects.has(id)
  }

  getUltimate(id: string): UltimateTemplate | undefined {
    return this.ultimates.get(id)
  }
  hasUltimate(id: string): boolean {
    return this.ultimates.has(id)
  }

  getEquipment(id: string): EquipmentTemplate | undefined {
    return this.equipments.get(id)
  }
  hasEquipment(id: string): boolean {
    return this.equipments.has(id)
  }

  getRelic(id: string): RelicTemplate | undefined {
    return this.relics.get(id)
  }
  hasRelic(id: string): boolean {
    return this.relics.has(id)
  }
}
