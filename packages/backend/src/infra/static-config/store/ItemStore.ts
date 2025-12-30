import { IItemStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { RelicTemplate, ItemTemplate } from '../../../domain/item/Item'
import { ItemRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'
/** 物品配置存儲：管理聖物樣板、骰選配置與約束條件 */
export class ItemStore implements IItemStore {
  private itemRollConstraints: Map<string, ItemRollConstraint> = new Map()
  private itemRollConfigs: Map<string, ItemRollConfig> = new Map()
  private relics: Map<string, RelicTemplate> = new Map()
  /** 取得所有物品骰選約束條件 */
  getAllItemRollConstraints(): ItemRollConstraint[] {
    return Array.from(this.itemRollConstraints.values())
  }
  /** 根據樣板 ID 查詢約束條件 */
  getItemRollConstraint(id: string): ItemRollConstraint {
    const constraint = this.itemRollConstraints.get(id)
    if (!constraint) {
      throw new ConfigNotFoundError('ItemRollConstraint', id)
    }
    return constraint
  }
  /** 檢查約束條件是否存在 */
  hasItemRollConstraint(id: string): boolean {
    return this.itemRollConstraints.has(id)
  }
  /** 根據來源類型查詢骰選配置 */
  getItemRollConfig(id: string): ItemRollConfig {
    const config = this.itemRollConfigs.get(id)
    if (!config) {
      throw new ConfigNotFoundError('ItemRollConfig', id)
    }
    return config
  }
  /** 檢查骰選配置是否存在 */
  hasItemRollConfig(id: string): boolean {
    return this.itemRollConfigs.has(id)
  }
  /** 根據 ID 查詢聖物樣板 */
  getRelic(id: string): RelicTemplate {
    const relic = this.relics.get(id)
    if (!relic) {
      throw new ConfigNotFoundError('RelicTemplate', id)
    }
    return relic
  }
  /** 檢查聖物樣板是否存在 */
  hasRelic(id: string): boolean {
    return this.relics.has(id)
  }
  /** 批量查詢物品樣板(目前返回聖物) */
  getManyItems(ids: string[]): ItemTemplate[] {
    const relics = this.getManyRelics(ids)
    return [...relics]
  }
  /** 取得所有物品樣板 */
  getAllItems(): ItemTemplate[] {
    return this.getAllRelics()
  }
  /** 取得所有聖物樣板 */
  getAllRelics(): RelicTemplate[] {
    return Array.from(this.relics.values())
  }
  /** 根據 ID 列表批量查詢聖物樣板 */
  getManyRelics(ids: string[]): RelicTemplate[] {
    return ids.map((id) => this.getRelic(id))
  }
  /** 批量存儲聖物樣板 */
  setMany(relics: RelicTemplate[]): void {
    for (const relic of relics) {
      this.relics.set(relic.id, relic)
    }
  }
  /** 批量存儲骰選配置 */
  setItemRollConfigs(configs: ItemRollConfig[]): void {
    for (const config of configs) {
      this.itemRollConfigs.set(config.sourceType, config)
    }
  }
  /** 批量存儲約束條件 */
  setItemRollConstraints(constraints: ItemRollConstraint[]): void {
    for (const constraint of constraints) {
      this.itemRollConstraints.set(constraint.templateId, constraint)
    }
  }
}
