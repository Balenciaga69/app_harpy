import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?°å?æº–å??€?‹è??†å™¨
 */
export class PreCombatState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?²å…¥?°å?æº–å?
    // 1. ?Ÿæ?è³½å?è®Šæ•¸
    // 2. é¡¯ç¤ºä¸‹æ³¨ä»‹é¢
    // 3. ç­‰å??©å®¶æº–å?å®Œæ?
  }
  exit(_context: RunContext): void {
    // ?¢é??°å?æº–å?
  }
  getAllowedTransitions(): string[] {
    return [RunState.COMBAT, RunState.MAP_VIEW]
  }
}
