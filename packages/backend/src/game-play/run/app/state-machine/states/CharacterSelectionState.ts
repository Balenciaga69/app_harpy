import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/game-play/run/interfaces/run-context'
import { RunState } from '@/game-play/run/interfaces/run-state'
/**
 * 角色?��??�?��??�器
 */
export class CharacterSelectionState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?�入角色?��??�面
    // UI 層�???��?�?��??�並顯示角色?��?介面
  }
  exit(_context: RunContext): void {
    // ?��?角色?��?
    // 確�?已選?��???
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.UNINITIALIZED]
  }
}
