import type { ICharacter } from '../../character/interfaces/character.interface'
import type { ICombatContext } from '../../../context'
export interface IEffect {
  readonly id: string
  readonly name: string
  onApply(character: ICharacter, context: ICombatContext): void
  onRemove(character: ICharacter, context: ICombatContext): void
  onTick?(character: ICharacter, context: ICombatContext): void
}
