import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * 瑙掕壊?告??�?嬭??嗗櫒
 */
export class CharacterSelectionState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?插叆瑙掕壊?告??潰
    // UI 灞ゆ???伣?�?嬭??栦甫椤ず瑙掕壊?告?浠嬮潰
  }
  exit(_context: RunContext): void {
    // ?㈤?瑙掕壊?告?
    // 纰轰?宸查伕?囪???
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.UNINITIALIZED]
  }
}
