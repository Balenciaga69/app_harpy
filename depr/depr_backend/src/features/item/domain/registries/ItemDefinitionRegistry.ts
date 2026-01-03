import { IItemDefinition } from '../../interfaces/definitions/IItemDefinition'
import { ItemError } from '../errors/ItemError'
/**
 * ItemDefinitionRegistry
 *
 * 物品定義的靜態註冊表，儲存所有 IItemDefinition 資料。
 * 類似資料庫，提供查詢與管理功能。
 */
export class ItemDefinitionRegistry {
  private readonly definitions = new Map<string, IItemDefinition>()
  /** 註冊物品定義 */
  register(definition: IItemDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw ItemError.duplicateDefinition('ItemDefinition', definition.id)
    }
    this.definitions.set(definition.id, definition)
  }
  /** 批量註冊物品定義 */
  registerMany(definitions: IItemDefinition[]): void {
    for (const def of definitions) {
      this.register(def)
    }
  }
  /** 根據 ID 取得物品定義 */
  get(id: string): IItemDefinition | undefined {
    return this.definitions.get(id)
  }
  /** 取得所有物品定義 */
  getAll(): IItemDefinition[] {
    return Array.from(this.definitions.values())
  }
  /** 檢查是否存在指定 ID 的物品定義 */
  has(id: string): boolean {
    return this.definitions.has(id)
  }
  /** 清除所有註冊的物品定義 */
  clear(): void {
    this.definitions.clear()
  }
  /** 取得註冊的物品定義數量 */
  get count(): number {
    return this.definitions.size
  }
}
