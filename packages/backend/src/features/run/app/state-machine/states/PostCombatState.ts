import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?°å?çµç??€?‹è??†å™¨
 */
export class PostCombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?²å…¥?°å?çµç?
    // 1. çµç?ä¸‹æ³¨?å‹µ
    // 2. é¡¯ç¤º?°é¬¥çµæ?
    // 3. ?¨é€²é€²åº¦
  }
  exit(_context: RunContext): void {
    // ?¢é??°å?çµç?
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.SHOP, RunState.VICTORY]
  }
}
