import type { ICharacter } from '../../character/interfaces/character.interface'
import type { CombatContext } from '../../../context'
export interface IEffect {
  readonly id: string
  readonly name: string
  onApply(character: ICharacter, context: CombatContext): void
  onRemove(character: ICharacter, context: CombatContext): void
  onTick?(character: ICharacter, context: CombatContext): void
}
