import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?†å??€?‹è??†å™¨
 */
export class ShopState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?²å…¥?†å?
    // ?·æ–°?†å??—è¡¨
  }
  exit(_context: RunContext): void {
    // ?¢é??†å?
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.PRE_COMBAT]
  }
}
