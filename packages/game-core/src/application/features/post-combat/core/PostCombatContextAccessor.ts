import { PostCombatContext } from '../../../../domain/post-combat/PostCombat'
import { RunStatus } from '../../../../domain/run/RunTypes'
import { IContextSnapshotAccessor } from '../../../core-infrastructure/context/service/AppContextService'
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
