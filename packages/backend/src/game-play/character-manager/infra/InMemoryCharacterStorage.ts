import type { ICharacterInstance, ICharacterStorage } from '../interfaces'

/* 記憶體角色儲存實作（僅供測試使用） */
export class InMemoryCharacterStorage implements ICharacterStorage {
  private readonly storage: Map<string, ICharacterInstance>

  constructor() {
    this.storage = new Map()
  }

  /* 儲存角色實例 */
  async save(character: ICharacterInstance): Promise<void> {
    this.storage.set(character.id, { ...character })
  }

  /* 根據 ID 載入角色實例 */
  async load(characterId: string): Promise<ICharacterInstance | null> {
    const character = this.storage.get(characterId)
    return character ? { ...character } : null
  }

  /* 檢查角色是否存在 */
  async exists(characterId: string): Promise<boolean> {
    return this.storage.has(characterId)
  }

  /* 刪除角色實例 */
  async delete(characterId: string): Promise<void> {
    this.storage.delete(characterId)
  }

  /* 清空所有角色（測試用） */
  clear(): void {
    this.storage.clear()
  }

  /* 獲取所有角色（測試用） */
  getAll(): ICharacterInstance[] {
    return Array.from(this.storage.values())
  }
}
