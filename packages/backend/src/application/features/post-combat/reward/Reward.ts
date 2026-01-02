import { CharacterAggregate } from '../../../../domain/character/Character'
import { Stash } from '../../../../domain/stash/Stash'
import { CombatRewardType, CombatReward } from '../../../../domain/post-combat/PostCombat'
export interface RewardGenerationContext {
  readonly character: CharacterAggregate
  readonly difficulty: 'NORMAL' | 'ELITE' | 'BOSS' | 'ENDLESS'
  readonly stash: Stash
}
export interface IRewardStrategy {
  readonly type: CombatRewardType
  generate(context: RewardGenerationContext): Promise<CombatReward>
}
