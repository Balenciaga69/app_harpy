import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { RunStatus } from '../../../../domain/run/RunTypes'
import { IContextSnapshotAccessor } from '../../../core-infrastructure/context/service/AppContextService'

/**
 * 戰鬥後上下文存取器
 * 職責：純粹的讀取操作，不涉及驗證或轉換
 */
export interface IPostCombatContextAccessor {
  getPostCombatContext(): PostCombatContext | undefined
  getRemainingFailRetries(): number
  getRunStatus(): RunStatus
}

export class PostCombatContextAccessor implements IPostCombatContextAccessor {
  constructor(private contextAccessor: IContextSnapshotAccessor) {}

  public getPostCombatContext(): PostCombatContext | undefined {
    return this.contextAccessor.getRunContext().temporaryContext?.postCombat
  }

  public getRemainingFailRetries(): number {
    return this.contextAccessor.getRunContext().remainingFailRetries
  }

  public getRunStatus() {
    return this.contextAccessor.getRunStatus()
  }
}
