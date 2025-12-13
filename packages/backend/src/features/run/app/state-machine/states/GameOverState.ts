import type { IRunStateHandler } from '../../../interfaces/IRunStateHandler'
import { RunContext } from '@/features/run/interfaces/run-context'
import { RunState } from '@/features/run/interfaces/run-state'
/**
 * ?Šæˆ²çµæ??€?‹è??†å™¨
 */
export class GameOverState implements IRunStateHandler {
  enter(_context: RunContext): void {
    // ?²å…¥?Šæˆ²çµæ?
    // æª¢æŸ¥?¯å¦?‰ç??½é???
    // é¡¯ç¤ºçµæ??«é¢
  }
  exit(_context: RunContext): void {
    // ?¢é??Šæˆ²çµæ?
  }
  getAllowedTransitions(): string[] {
    return [RunState.SHOP, RunState.UNINITIALIZED] // çºŒå‘½?å?åº—ï??–é??°é?å§?
  }
}
