import { PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { Result } from '../../../shared/result/Result'
export class PostCombatProcessor {
  constructor() {}
  /** @Copilot 給我中文註解 */
  public process(postCombatCtx: PostCombatContext): Result<void> {
    if (postCombatCtx.result === 'WIN') {
      // createRewards
      // 存入DB
    }
    if (postCombatCtx.result === 'LOSE') {
      // 進行扣除重試次數或死亡
    }
    return Result.success(undefined)
  }
}
/**
 * 獎勵工廠
 * 職責：根據獎勵類型生成對應的獎勵選項
 * 設計：遵循策略模式，支援多種獎勵生成策略
 * 依賴：物品生成服務、獎勵生成策略集合
 */
// export class RewardFactory {
//   constructor(
//     private itemGenerationService: IItemGenerationService,
//     private rewardStrategies: Map<CombatRewardType, IRewardStrategy>
//   ) {}

//   /**
//    * 建立獎勵組
//    * 返回多個獎勵選項，玩家從中選擇一個
//    * 遵循設計：第一組為親合度導向、第二組為稀有度導向
//    */
//   public createRewards(context: RewardGenerationContext): Result<CombatReward[]> {
//     const rewards: CombatReward[] = []

//     // 第一組：高親合度獎勵 - MostFrequentTagRewardModifierStrategy
//     const goldReward = this.itemGenerationService.generateRandomItemFromReward('GOLD')

//     // 第二組：高稀有度獎勵 - RarityRewardModifierStrategy + ReverseFrequentTagRewardModifierStrategy

//     return Result.success(rewards)
//   }
// }
