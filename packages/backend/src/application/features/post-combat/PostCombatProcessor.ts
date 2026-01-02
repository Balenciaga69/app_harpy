import { ItemAggregate } from '../../../domain/item/Item'
import { CombatReward, PostCombatContext } from '../../../domain/post-combat/PostCombat'
import { PriceHelper } from '../../../domain/shop/PriceHelper'
import { Result } from '../../../shared/result/Result'
import { IItemGenerationService } from '../../content-generation/service/item/ItemGenerationService'
import { IContextToDomainConverter } from '../../core-infrastructure/context/helper/ContextToDomainConverter'
import {
  IAppContextService,
  IConfigStoreAccessor,
  IContextMutator,
  IContextSnapshotAccessor,
} from '../../core-infrastructure/context/service/AppContextService'
import { IContextUnitOfWork } from '../../core-infrastructure/context/service/ContextUnitOfWork'
import { RewardGenerationContext } from './reward/Reward'
export class PostCombatProcessor {
  constructor(
    private rewardFactory: IRewardFactory,
    private contextSnapshotAccessor: IContextSnapshotAccessor,
    private contextUnitOfWork: IContextUnitOfWork,
    private contextAccessor: IContextSnapshotAccessor,
    private contextToDomainConverter: IContextToDomainConverter
  ) {}
  public process(): Result<void> {
    const postCombatCtx: PostCombatContext = this.contextAccessor.getRunContext().temporaryContext.postCombat
    if (!postCombatCtx) {
      return Result.fail('PostCombat context is missing') //FIXME: 改 成適當的錯誤代碼
    }
    if (postCombatCtx.result === 'WIN') {
      const rewardContext: RewardGenerationContext = {
        character: this.contextToDomainConverter.convertCharacterContextToDomain(),
        difficulty: postCombatCtx.combatDifficulty,
        stash: this.contextToDomainConverter.convertStashContextToDomain(),
      }
      const rewardResult = this.rewardFactory.createRewards(rewardContext)
      if (rewardResult.isFailure) {
        return Result.fail(rewardResult.error!)
      }
      this.contextUnitOfWork.updateRunContext({
        ...this.contextAccessor.getRunContext(),
        temporaryContext: {
          postCombat: {},
        },
      })
      // 存入DB
    }
    if (postCombatCtx.result === 'LOSE') {
      // 進行扣除重試次數或死亡
    }
    return Result.success(undefined)
  }
}

interface IRewardFactory {
  createRewards(context: RewardGenerationContext): Result<CombatReward[]>
}
export class RewardFactory {
  constructor(
    private itemGenerationService: IItemGenerationService,
    private configStoreAccessor: IConfigStoreAccessor
  ) {}
  public createRewards(context: RewardGenerationContext): Result<CombatReward[]> {
    const rewards: CombatReward[] = []
    // 首領獎勵
    if (context.difficulty === 'BOSS') {
      const result = this.itemGenerationService.generateRandomItemFromReward('BOSS_REWARD')
      if (result.isFailure) return Result.fail(result.error!)
      rewards.push({ type: 'BOSS_REWARD', itemRecords: [result.value!.record], gold: 0 })
    }
    // 精英獎勵
    if (context.difficulty === 'ELITE') {
      const result = this.itemGenerationService.generateRandomItemFromReward('ELITE_REWARD')
      if (result.isFailure) return Result.fail(result.error!)
      rewards.push({ type: 'ELITE_REWARD', itemRecords: [result.value!.record], gold: 0 })
    }
    if (context.difficulty === 'NORMAL') {
      // Reward A
      const highAffinityResult = this.itemGenerationService.generateRandomItemFromReward('HIGH_AFFINITY')
      if (highAffinityResult.isFailure) return Result.fail(highAffinityResult.error!)
      rewards.push({ type: 'HIGH_AFFINITY', itemRecords: [highAffinityResult.value!.record], gold: 0 })
      // Reward B
      const gold = this.createGold(highAffinityResult.value!)
      rewards.push({ type: 'GOLD', itemRecords: [], gold })
      // Reward C
      const highRarityResult = this.itemGenerationService.generateRandomItemFromReward('HIGH_RARITY_RELIC')
      if (highRarityResult.isFailure) return Result.fail(highRarityResult.error!)
      rewards.push({ type: 'HIGH_RARITY_RELIC', itemRecords: [highRarityResult.value!.record], gold: 0 })
      // Reward D
      const lowAffinityResult = this.itemGenerationService.generateRandomItemFromReward('LOW_AFFINITY')
      if (lowAffinityResult.isFailure) return Result.fail(lowAffinityResult.error!)
      rewards.push({ type: 'LOW_AFFINITY', itemRecords: [lowAffinityResult.value!.record], gold: 0 })
    }
    if (context.difficulty === 'ENDLESS') {
      //TODO: 暫時沒想法
    }
    return Result.success(rewards)
  }
  /* 根據物品計算金幣數量 */
  private createGold = (item: ItemAggregate) => {
    const { shopStore } = this.configStoreAccessor.getConfigStore()
    const config = shopStore.getShopConfig('DEFAULT')
    const rarity = item.template.rarity
    const difficulty = item.record.atCreated.difficulty
    const gold = PriceHelper.calculateItemPrice({ config, difficulty, rarity, isBuying: true, isDiscounted: false })
    return gold
  }
}
