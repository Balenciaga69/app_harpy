import { CharacterError } from '../../domain/CharacterError'
import { IClassDefinition } from '../../interfaces/definitions/IClassDefinition'
import { IClassDefinitionRegistry } from '../../interfaces/registries/IClassDefinitionRegistry'
export class ClassDefinitionRegistry implements IClassDefinitionRegistry {
  private readonly definitions = new Map<string, IClassDefinition>()
  /** 註冊職業定義 */
  register(definition: IClassDefinition): void {
    if (this.definitions.has(definition.id)) {
      throw CharacterError.duplicateClassDefinition(definition.id)
    }
    this.definitions.set(definition.id, definition)
  }
  /** 批量註冊職業定義 */
  registerMany(definitions: IClassDefinition[]): void {
    for (const def of definitions) {
      this.register(def)
    }
  }
  /** 根據 ID 取得職業定義 */
  get(id: string): IClassDefinition | undefined {
    return this.definitions.get(id)
  }
  /** 取得所有職業定義 */
  getAll(): IClassDefinition[] {
    return Array.from(this.definitions.values())
  }
  /** 檢查是否存在指定 ID 的職業定義 */
  has(id: string): boolean {
    return this.definitions.has(id)
  }
  /** 清除所有註冊的職業定義 */
  clear(): void {
    this.definitions.clear()
  }
  /** 取得註冊的職業定義數量 */
  get count(): number {
    return this.definitions.size
  }
}
