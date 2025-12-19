import type { IAffixDefinition } from '../../interfaces/definitions/IAffixDefinition'
import { ItemError } from '../errors/ItemError'
/**
 * AffixDefinitionRegistry
 *
 * 詞綴定義的靜態註冊表，儲存所有 IAffixDefinition 資料。
 * 類似資料庫，提供查詢與管理功能。
 */
export class AffixDefinitionRegistry {
  private readonly definitions = new Map<string, IAffixDefinition>()
  /** 註冊詞綴定義 */
  register(definition: IAffixDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw ItemError.duplicateDefinition('AffixDefinition', definition.id)
    }
    this.definitions.set(definition.id, definition)
  }
  /** 批量註冊詞綴定義 */
  registerMany(definitions: IAffixDefinition[]): void {
    for (const def of definitions) {
      this.register(def)
    }
  }
  /** 根據 ID 取得詞綴定義 */
  get(id: string): IAffixDefinition | undefined {
    return this.definitions.get(id)
  }
  /** 根據多個 ID 取得詞綴定義列表 */
  getMany(ids: string[]): IAffixDefinition[] {
    return ids.map((id) => this.definitions.get(id)).filter((def): def is IAffixDefinition => def !== undefined)
  }
  /** 取得所有詞綴定義 */
  getAll(): IAffixDefinition[] {
    return Array.from(this.definitions.values())
  }
  /** 根據階級篩選詞綴定義 */
  getByTier(tier: number): IAffixDefinition[] {
    return this.getAll().filter((def) => def.tier === tier)
  }
  /** 檢查是否存在指定 ID 的詞綴定義 */
  has(id: string): boolean {
    return this.definitions.has(id)
  }
  /** 清除所有註冊的詞綴定義 */
  clear(): void {
    this.definitions.clear()
  }
  /** 取得註冊的詞綴定義數量 */
  get count(): number {
    return this.definitions.size
  }
}
