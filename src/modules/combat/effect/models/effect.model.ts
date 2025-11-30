import type { ICharacter } from '../../character'
import type { CombatContext } from '../../core/CombatContext'
export interface IEffect {
  readonly id: string
  readonly name: string
  onApply(character: ICharacter, context: CombatContext): void
  onRemove(character: ICharacter, context: CombatContext): void
  onTick?(character: ICharacter, context: CombatContext): void
}
