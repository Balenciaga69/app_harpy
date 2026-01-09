import { IItemStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/Item'
import { ItemRollConfig, RewardRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { CombatRewardType } from '../../../domain/post-combat/PostCombat'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'
export class ItemStore implements IItemStore {
  private itemRollConstraints: Map<string, ItemRollConstraint> = new Map()
  private itemRollConfigs: Map<string, ItemRollConfig> = new Map()
  private rewardRollConfigs: Map<string, RewardRollConfig> = new Map()
  private relics: Map<string, RelicTemplate> = new Map()
  getAllItemRollConstraints(): ItemRollConstraint[] {
    return Array.from(this.itemRollConstraints.values())
  }
  getItemRollConstraint(id: string): ItemRollConstraint {
    const constraint = this.itemRollConstraints.get(id)
    if (!constraint) {
      throw new ConfigNotFoundError('ItemRollConstraint', id)
    }
    return constraint
  }
  hasItemRollConstraint(id: string): boolean {
    return this.itemRollConstraints.has(id)
  }
  getItemRollConfig(id: string): ItemRollConfig {
    const config = this.itemRollConfigs.get(id)
    if (!config) {
      throw new ConfigNotFoundError('ItemRollConfig', id)
    }
    return config
  }
  hasItemRollConfig(id: string): boolean {
    return this.itemRollConfigs.has(id)
  }
  getRewardRollConfig(rewardType: CombatRewardType): RewardRollConfig | undefined {
    return this.rewardRollConfigs.get(rewardType)
  }
  getRelic(id: string): RelicTemplate {
    const relic = this.relics.get(id)
    if (!relic) {
      throw new ConfigNotFoundError('RelicTemplate', id)
    }
    return relic
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
    return ids.map((id) => this.getRelic(id))
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
  setRewardRollConfigs(configs: RewardRollConfig[]): void {
    for (const config of configs) {
      this.rewardRollConfigs.set(config.rewardType, config)
    }
  }
  setItemRollConstraints(constraints: ItemRollConstraint[]): void {
    for (const constraint of constraints) {
      this.itemRollConstraints.set(constraint.templateId, constraint)
    }
  }
}
