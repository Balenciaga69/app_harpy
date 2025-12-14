import type { ICharacterInstance } from './ICharacterInstance'

/* 角色實例工廠介面 */
export interface ICharacterInstanceFactory {
  /* 根據角色定義 ID 創建角色實例 */
  createInstance(characterDefinitionId: string): Promise<ICharacterInstance>
}
