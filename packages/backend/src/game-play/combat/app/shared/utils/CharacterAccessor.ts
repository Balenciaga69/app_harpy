import { ICharacter } from '@/game-play/combat/interfaces/character/ICharacter'
import { ICombatContext } from '@/game-play/combat/interfaces/context/ICombatContext'
import { CombatError } from '@/game-play/combat/domain/errors/CombatError'
import type { CombatFailure } from '@/game-play/combat/interfaces/errors/CombatFailure'
import { Failures } from '@/game-play/combat/domain/errors/FailureFactory'
import { Result } from '@/game-play/combat/domain/errors/Result'
/**
 * CharacterAccessor
 *
 * 從登記表取得角色的輔助工具，並處理錯誤。
 * 可減少 Effect 與 Ultimate 實作中的樣板程式碼。
 *
 * 同時提供會拋例外與回傳 Result 的方法：
 * - get(): 用於內部可信任邏輯，角色必須存在
 * - getResult(): 用於可能失敗並需優雅處理的操作
 */
export class CharacterAccessor {
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
  }
  /**
   * 以 ID 取得角色，若找不到會拋出 CombatError
   * 用於角色必須存在（內部邏輯）
   */
  get(id: string): ICharacter {
    const character = this.context.registry.getCharacter(id) as ICharacter | undefined
    if (!character) {
      throw CombatError.fromFailure(Failures.characterNotFound(id, this.context.getCurrentTick()))
    }
    return character
  }
  /**
   * 以 Result 模式取得角色（不拋例外）
   * 用於可能失敗並需優雅處理的操作
   */
  getResult(id: string): Result<ICharacter, CombatFailure> {
    const character = this.context.registry.getCharacter(id) as ICharacter | undefined
    if (!character) {
      return Result.fail(Failures.characterNotFound(id, this.context.getCurrentTick()))
    }
    return Result.ok(character)
  }
  /**
   * 嘗試以 ID 取得角色，找不到時回傳 undefined
   * 用於角色可能不存在的情況（邊界情境）
   */
  tryGet(id: string): ICharacter | undefined {
    return this.context.registry.getCharacter(id) as ICharacter | undefined
  }
  /**
   * 檢查 registry 中是否存在該角色
   */
  has(id: string): boolean {
    return this.context.registry.hasCharacter(id)
  }
  /**
   * 取得存活的角色；若角色不存在或已死亡則回傳失敗
   */
  getAlive(id: string): Result<ICharacter, CombatFailure> {
    const result = this.getResult(id)
    if (result.isFail()) {
      return result
    }
    if (result.value.isDead) {
      return Result.fail(Failures.characterDead(id, this.context.getCurrentTick()))
    }
    return result
  }
}
