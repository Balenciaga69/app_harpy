import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?åˆ©?€?‹è??†å™¨
 */
export class VictoryState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?²å…¥?åˆ©?€??
    // é¡¯ç¤º?åˆ©?«é¢ï¼ˆå??æ??‰é??¡æ??”æ??¹æ?æ¢ä»¶ï¼?
  }
  exit(_context: RunContext): void {
    // ?¢é??åˆ©?€??
  }
  getAllowedTransitions(): string[] {
    return [RunState.UNINITIALIZED] // ?åˆ°ä¸»é¸??
  }
}
