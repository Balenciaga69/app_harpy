import { PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { Result } from '../../../shared/result/Result'
export class PostCombatProcessor {
  constructor() {}
  /** @Copilot 給我中文註解 */
  public process(postCombatCtx: PostCombatContext): Result<void> {
    if (postCombatCtx.result === 'WIN') {
      // 進行獎勵內容生成
      // 存入DB
    }
    if (postCombatCtx.result === 'LOSE') {
      // 進行扣除重試次數或死亡
    }
    return Result.success(undefined)
  }
}
/** 獎勵工廠 */
export class RewardFactory {
  constructor() {}
}
