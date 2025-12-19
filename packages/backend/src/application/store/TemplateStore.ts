import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffect } from '../../domain/affix/effect/AffixEffect'
import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { EquipmentTemplate, RelicTemplate } from '../../domain/item/ItemTemplate'
import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'
import { IEnemyConfigLoader } from './IEnemyConfigLoader'

export class TemplateStore {
  // Maps
  public enemies: Map<string, EnemyTemplate> = new Map()
  public enemySpawnInfo: Map<string, EnemySpawnInfo> = new Map()
  public affixes: Map<string, AffixTemplate> = new Map()
  public affixEffects: Map<string, AffixEffect> = new Map()
  public ultimates: Map<string, UltimateTemplate> = new Map()
  public equipments: Map<string, EquipmentTemplate> = new Map()
  public relics: Map<string, RelicTemplate> = new Map()
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
    const { configs, spawnInfo } = await this.enemyConfigLoader.load()
    configs.forEach((config) => {
      this.enemies.set(config.enemyTemplate.id, config.enemyTemplate)
      config.affixTemplates.forEach((affix) => this.affixes.set(affix.id, affix))
      config.affixEffects.forEach((effect) => this.affixEffects.set(effect.id, effect))
      this.ultimates.set(config.ultimateTemplate.id, config.ultimateTemplate)
    })
    spawnInfo.forEach((info) => this.enemySpawnInfo.set(info.templateId, info))
  }
}
