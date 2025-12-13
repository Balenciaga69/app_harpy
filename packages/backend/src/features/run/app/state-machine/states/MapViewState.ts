import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?°å??è¦½?€?‹è??†å™¨
 */
export class MapViewState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?²å…¥?°å??è¦½
    // é¡¯ç¤º?¶å?ç« ç???10 ?‹ç?é»?
  }
  exit(_context: RunContext): void {
    // ?¢é??°å?
  }
  getAllowedTransitions(): string[] {
    return [RunState.PRE_COMBAT, RunState.SHOP, RunState.EVENT, RunState.GAME_OVER]
  }
}
