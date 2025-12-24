import { ItemTemplate, RelicTemplate } from '../../../../domain/item/ItemTemplate'
import { ItemRollConfig } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../../domain/item/roll/ItemRollConstraint'
import { IItemStore } from './IConfigStores'

export class ItemStore implements IItemStore {
  private itemRollConstraints: Map<string, ItemRollConstraint> = new Map()
  private itemRollConfigs: Map<string, ItemRollConfig> = new Map()
  private relics: Map<string, RelicTemplate> = new Map()

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

  getRelic(id: string): RelicTemplate | undefined {
    return this.relics.get(id)
  }

  hasRelic(id: string): boolean {
    return this.relics.has(id)
  }

  getManyItems(ids: string[]): ItemTemplate[] {
    const relics = this.getManyRelics(ids)
    return [...relics]
  }

  getAllItems(): ItemTemplate[] {
    return this.getAllRelics()
  }

  getAllRelics(): RelicTemplate[] {
    return Array.from(this.relics.values())
  }

  getManyRelics(ids: string[]): RelicTemplate[] {
    const relics: RelicTemplate[] = []
    for (const id of ids) {
      const found = this.getRelic(id)
      if (found) {
        relics.push(found)
      }
    }
    return relics
  }

  setMany(relics: RelicTemplate[]): void {
    for (const relic of relics) {
      this.relics.set(relic.id, relic)
    }
  }

  setItemRollConfigs(configs: ItemRollConfig[]): void {
    for (const config of configs) {
      this.itemRollConfigs.set(config.sourceType, config)
    }
  }

  setItemRollConstraints(constraints: ItemRollConstraint[]): void {
    for (const constraint of constraints) {
      this.itemRollConstraints.set(constraint.templateId, constraint)
    }
  }
}
