import { CharacterAggregate } from '../../../../domain/character/Character'
import { CombatDifficultyType, CombatReward, CombatRewardType } from '../../../../domain/post-combat/PostCombat'
import { Stash } from '../../../../domain/stash/Stash'
export interface RewardGenerationContext {
  readonly character: CharacterAggregate
  readonly difficulty: CombatDifficultyType
  readonly stash: Stash
}
export interface IRewardStrategy {
  readonly type: CombatRewardType
  generate(context: RewardGenerationContext): Promise<CombatReward>
}
