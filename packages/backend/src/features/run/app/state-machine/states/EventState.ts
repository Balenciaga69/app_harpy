import { RunState } from '@/features/run/interfaces/run-state'
import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
/**
 * äº‹ä»¶è§¸ç™¼?€?‹è??†å™¨
 */
export class EventState implements IRunStateHandler {
  async enter(_context: RunContext): Promise<void> {
    // ?²å…¥äº‹ä»¶
    // è§¸ç™¼?¨æ?äº‹ä»¶
  }
  exit(_context: RunContext): void {
    // ?¢é?äº‹ä»¶
  }
  getAllowedTransitions(): string[] {
    return [RunState.MAP_VIEW, RunState.SHOP]
  }
}
