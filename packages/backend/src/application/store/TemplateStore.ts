import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { EquipmentTemplate, RelicTemplate } from '../../domain/item/ItemTemplate'
import { ItemRollConfig } from '../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../domain/item/roll/ItemRollConstraint'
import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'
import { ChapterLevel } from '../../shared/models/TemplateWeightInfo'
import { IAffixStore, IEnemyStore, IItemStore, IUltimateStore } from './IConfigStores'

export class EnemyStore implements IEnemyStore {
  enemies: Map<string, EnemyTemplate> = new Map()
  enemySpawnInfos: Map<string, EnemySpawnInfo> = new Map()

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
}

export class ItemStore implements IItemStore {
  itemRollConstraints: Map<string, ItemRollConstraint> = new Map()
  itemRollConfigs: Map<string, ItemRollConfig> = new Map()
  equipments: Map<string, EquipmentTemplate> = new Map()
  relics: Map<string, RelicTemplate> = new Map()

  getAllItemRollConstraints(): ItemRollConstraint[] {
    return Array.from(this.itemRollConstraints.values())
  }
  getItemRollConstraint(id: string): ItemRollConstraint | undefined {
    return this.itemRollConstraints.get(id)
  }
  hasItemRollConstraint(id: string): boolean {
    return this.itemRollConstraints.has(id)
  }
  getItemRollConfig(id: string): ItemRollConfig | undefined {
    return this.itemRollConfigs.get(id)
  }
  hasItemRollConfig(id: string): boolean {
    return this.itemRollConfigs.has(id)
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
  getManyItems(ids: string[]): (EquipmentTemplate | RelicTemplate)[] {
    const items: (EquipmentTemplate | RelicTemplate)[] = []
    for (const id of ids) {
      const equipment = this.getEquipment(id)
      if (equipment) {
        items.push(equipment)
        continue
      }
      const relic = this.getRelic(id)
      if (relic) {
        items.push(relic)
        continue
      }
    }
    return items
  }
}

export class AffixStore implements IAffixStore {
  affixes: Map<string, AffixTemplate> = new Map()
  affixEffects: Map<string, AffixEffectTemplate> = new Map()

  getAffix(id: string): AffixTemplate | undefined {
    return this.affixes.get(id)
  }
  hasAffix(id: string): boolean {
    return this.affixes.has(id)
  }
  getAffixEffect(id: string): AffixEffectTemplate | undefined {
    return this.affixEffects.get(id)
  }
  hasAffixEffect(id: string): boolean {
    return this.affixEffects.has(id)
  }
}

export class UltimateStore implements IUltimateStore {
  ultimates: Map<string, UltimateTemplate> = new Map()

  getUltimate(id: string): UltimateTemplate | undefined {
    return this.ultimates.get(id)
  }
  hasUltimate(id: string): boolean {
    return this.ultimates.has(id)
  }
}
