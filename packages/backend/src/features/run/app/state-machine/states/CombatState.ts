import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?°é¬¥ä¸­ç??‹è??†å™¨
 */
export class CombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?²å…¥?°é¬¥
    // èª¿ç”¨ CombatEngine ?·è??°é¬¥
    // ?°é¬¥?¨ç¬?“å??ï?è¿”å?çµæ?
  }
  exit(_context: RunContext): void {
    // ?¢é??°é¬¥
  }
  getAllowedTransitions(): string[] {
    return [RunState.POST_COMBAT, RunState.GAME_OVER]
  }
}
