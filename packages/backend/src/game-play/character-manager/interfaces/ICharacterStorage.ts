import type { ICharacterInstance } from './ICharacterInstance'

/* 角色儲存介面 */
export interface ICharacterStorage {
  /* 儲存角色實例 */
  save(character: ICharacterInstance): Promise<void>

  /* 根據 ID 載入角色實例 */
  load(characterId: string): Promise<ICharacterInstance | null>

  /* 檢查角色是否存在 */
  exists(characterId: string): Promise<boolean>

  /* 刪除角色實例 */
  delete(characterId: string): Promise<void>
}
