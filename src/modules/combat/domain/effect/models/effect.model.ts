import type { ICombatContext } from '../../../context'

export interface IEffect {
  readonly id: string
  readonly name: string
  onApply(characterId: string, context: ICombatContext): void
  onRemove(characterId: string, context: ICombatContext): void
  onTick?(characterId: string, context: ICombatContext): void
}
