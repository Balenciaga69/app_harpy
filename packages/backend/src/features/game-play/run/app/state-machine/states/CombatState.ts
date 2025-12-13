import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/game-play/run/interfaces/run-context'
import { RunState } from '@/features/game-play/run/interfaces/run-state'
/**
 * ?�鬥中�??��??�器
 */
export class CombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?�入?�鬥
    // 調用 CombatEngine ?��??�鬥
    // ?�鬥?�瞬?��??��?返�?結�?
  }
  exit(_context: RunContext): void {
    // ?��??�鬥
  }
  getAllowedTransitions(): string[] {
    return [RunState.POST_COMBAT, RunState.GAME_OVER]
  }
}
