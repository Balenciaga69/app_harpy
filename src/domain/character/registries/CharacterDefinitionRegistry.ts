import type { ICharacterDefinition } from '../definitions'
import { CharacterError } from '../errors'
/**
 * CharacterDefinitionRegistry
 *
 * 角色定義的靜態註冊表，儲存所有 ICharacterDefinition 資料。
 * 類似資料庫，提供查詢與管理功能。
 */
export class CharacterDefinitionRegistry {
  private readonly definitions = new Map<string, ICharacterDefinition>()
  /** 註冊角色定義 */
  register(definition: ICharacterDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw CharacterError.duplicateCharacterDefinition(definition.id)
    }
    this.definitions.set(definition.id, definition)
  }
  /** 批量註冊角色定義 */
  registerMany(definitions: ICharacterDefinition[]): void {
    for (const def of definitions) {
      this.register(def)
    }
  }
  /** 根據 ID 取得角色定義 */
  get(id: string): ICharacterDefinition | undefined {
    return this.definitions.get(id)
  }
  /** 根據職業 ID 取得所有角色定義 */
  getByClass(classId: string): ICharacterDefinition[] {
    return Array.from(this.definitions.values()).filter((def) => def.classId === classId)
  }
  /** 取得所有角色定義 */
  getAll(): ICharacterDefinition[] {
    return Array.from(this.definitions.values())
  }
  /** 檢查是否存在指定 ID 的角色定義 */
  has(id: string): boolean {
    return this.definitions.has(id)
  }
  /** 清除所有註冊的角色定義 */
  clear(): void {
    this.definitions.clear()
  }
  /** 取得註冊的角色定義數量 */
  get count(): number {
    return this.definitions.size
  }
}
