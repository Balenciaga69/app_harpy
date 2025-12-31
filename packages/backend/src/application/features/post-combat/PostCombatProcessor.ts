import { PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { Result } from '../../../shared/result/Result'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'

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

// TODO: 這個可能會被搬出去 給 config 配置
/** 根據難度調整獎勵倍數 */
const REWARD_MULTIPLIER_BY_DIFFICULTY: Record<PostCombatContext['combatDifficulty'], number> = {
  ENDLESS: 3,
  BOSS: 3,
  ELITE: 2,
  NORMAL: 1,
}
// TODO: 這個可能會被搬出去 給 config 配置
const defaultRewardAmount = 100

/** 獎勵工廠 */
export class RewardFactory {
  constructor(private readonly appCtxService: IAppContextService) {}
  /** 計算獎勵價值 */
  private calculateRewardValue(postCombatCtx: PostCombatContext): number {
    const { difficulty } = this.appCtxService.getCurrentAtCreatedInfo()
    const rewardMultiplier = REWARD_MULTIPLIER_BY_DIFFICULTY[postCombatCtx.combatDifficulty]
    return difficulty * rewardMultiplier * defaultRewardAmount
  }
}
