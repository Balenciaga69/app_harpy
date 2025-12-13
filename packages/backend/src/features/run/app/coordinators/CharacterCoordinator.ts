import { RunContext } from '../../interfaces/run-context'
/**
 * 角色協調器
 * 封裝與 CharacterManager 的互動邏輯
 */
export class CharacterCoordinator {
  /**
   * 選擇角色
   */
  selectCharacter(_context: RunContext, characterId: string): void {
    // TODO: 調用 CharacterManager.selectCharacter()
    _context.characterId = characterId
  }
  /**
   * 取得角色實例
   */
  getCharacter(_context: RunContext): unknown {
    // TODO: 調用 CharacterManager.getCharacter(context.characterId)
    if (!_context.characterId) {
      //TODO: 用 Run 專屬的 error
      throw new Error('尚未選擇角色')
    }
    return null // placeholder
  }
  /**
   * 取得角色屬性面板
   */
  getCharacterStats(_context: RunContext): unknown {
    // TODO: 調用 CharacterModifierSystem 計算最終屬性
    return null // placeholder
  }
}
