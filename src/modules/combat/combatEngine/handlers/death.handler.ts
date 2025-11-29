import { useCharacterStore } from '../../character/character.store'
import { useCombatStatusStore } from '../combatStatus.store'
import { useCombatLogStore } from '../../combatLog/combatLog.store'
import type { DeathPayload } from '../handlerPayload.type'
import type { Character } from '../../character/character.model'
/** 死亡處理器 - 負責勝利判定 */
export class DeathHandler {
  handle(payload: DeathPayload): void {
    const { currentTick } = useCombatStatusStore.getState()
    const { addLog } = useCombatLogStore.getState()
    // 記錄死亡 log（快照由 store 自動處理）
    addLog({
      tick: currentTick,
      type: 'death',
      actorId: payload.characterId,
    } as const)
    const aliveCharacters = this.#getAliveCharacters()
    if (aliveCharacters.length === 1) {
      this.#declareVictory(aliveCharacters[0].id)
    }
  }
  /** 取得存活角色 */
  #getAliveCharacters(): Character[] {
    const { characters } = useCharacterStore.getState()
    return Array.from(characters.values()).filter((c) => !c.isDead())
  }
  /** 宣告勝利者 */
  #declareVictory(winnerId: string): void {
    useCombatStatusStore.getState().setWinnerId(winnerId)
    useCombatStatusStore.getState().setIsCombatOver(true)
  }
}
