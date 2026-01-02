import { ItemAggregate } from '../../../../domain/item/Item'
import { CombatDifficultyType, CombatReward } from '../../../../domain/post-combat/PostCombat'
import { PriceHelper } from '../../../../domain/shop/PriceHelper'
import { Result } from '../../../../shared/result/Result'
import { IItemGenerationService } from '../../../content-generation/service/item/ItemGenerationService'
import { IConfigStoreAccessor } from '../../../core-infrastructure/context/service/AppContextService'
/**
 * 獎勵工廠介面：定義獎勵生成契約
 */
export interface IRewardFactory {
  createRewards(difficulty: CombatDifficultyType): Result<CombatReward[]>
}
/**
 * 獎勵工廠：根據難度生成戰鬥獎勵
 * 職責：協調物品生成與金幣計算，無副作用
 * 邊界：依賴介面，易測試與替換
 */
export class RewardFactory implements IRewardFactory {
  // 難度對應的獎勵策略 Map，減少 if-else 巢狀
  private readonly rewardStrategies: Map<string, () => Result<CombatReward[]>> = new Map([
    ['BOSS', this.createBossRewards.bind(this)],
    ['ELITE', this.createEliteRewards.bind(this)],
    ['NORMAL', this.createNormalRewards.bind(this)],
    ['ENDLESS', this.createEndlessRewards.bind(this)],
  ])
  constructor(
    private itemGenerationService: IItemGenerationService,
    private configStoreAccessor: IConfigStoreAccessor
  ) {}
  /**
   * 生成獎勵：根據難度調用對應策略
   */
  public createRewards(difficulty: CombatDifficultyType): Result<CombatReward[]> {
    const strategy = this.rewardStrategies.get(difficulty)
    if (!strategy) {
      return Result.fail('Unsupported difficulty') // 可改為統一錯誤代碼
    }
    return strategy()
  }
  /**
   * 首領獎勵策略
   */
  private createBossRewards(): Result<CombatReward[]> {
    const result = this.itemGenerationService.generateRandomItemFromReward('BOSS_REWARD')
    if (result.isFailure) return Result.fail(result.error!)
    return Result.success([{ type: 'BOSS_REWARD', itemRecords: [result.value!.record], gold: 0 }])
  }
  /**
   * 精英獎勵策略
   */
  private createEliteRewards(): Result<CombatReward[]> {
    const result = this.itemGenerationService.generateRandomItemFromReward('ELITE_REWARD')
    if (result.isFailure) return Result.fail(result.error!)
    return Result.success([{ type: 'ELITE_REWARD', itemRecords: [result.value!.record], gold: 0 }])
  }
  /**
   * 普通獎勵策略：多項獎勵組合
   */
  private createNormalRewards(): Result<CombatReward[]> {
    const rewards: CombatReward[] = []
    // Reward A: 高親和物品
    const highAffinityResult = this.itemGenerationService.generateRandomItemFromReward('HIGH_AFFINITY')
    if (highAffinityResult.isFailure) return Result.fail(highAffinityResult.error!)
    rewards.push({ type: 'HIGH_AFFINITY', itemRecords: [highAffinityResult.value!.record], gold: 0 })
    // Reward B: 金幣（基於物品計算）
    const gold = this.calculateGold(highAffinityResult.value!)
    rewards.push({ type: 'GOLD', itemRecords: [], gold })
    // Reward C: 高稀有度物品
    const highRarityResult = this.itemGenerationService.generateRandomItemFromReward('HIGH_RARITY_RELIC')
    if (highRarityResult.isFailure) return Result.fail(highRarityResult.error!)
    rewards.push({ type: 'HIGH_RARITY_RELIC', itemRecords: [highRarityResult.value!.record], gold: 0 })
    // Reward D: 低親和物品
    const lowAffinityResult = this.itemGenerationService.generateRandomItemFromReward('LOW_AFFINITY')
    if (lowAffinityResult.isFailure) return Result.fail(lowAffinityResult.error!)
    rewards.push({ type: 'LOW_AFFINITY', itemRecords: [lowAffinityResult.value!.record], gold: 0 })
    return Result.success(rewards)
  }
  /**
   * 無盡獎勵策略（待實作）
   */
  private createEndlessRewards(): Result<CombatReward[]> {
    // TODO: 實作無盡模式獎勵邏輯
    return Result.success([])
  }
  /**
   * 計算金幣：基於物品屬性與配置
   */
  private calculateGold(item: ItemAggregate): number {
    const { shopStore } = this.configStoreAccessor.getConfigStore()
    const config = shopStore.getShopConfig('DEFAULT')
    const rarity = item.template.rarity
    const difficulty = item.record.atCreated.difficulty
    return PriceHelper.calculateItemPrice({ config, difficulty, rarity, isBuying: true, isDiscounted: false })
  }
}
