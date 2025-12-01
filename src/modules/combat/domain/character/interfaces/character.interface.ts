import { type IEntity, type CharacterId, type CharacterSnapshot } from '@/modules/combat/infra/shared'
import type { IAttributeProvider } from './attribute.provider.interface'
import type { IEffectOwner } from './effect.owner.interface'
import type { IUltimateOwner } from './ultimate.owner.interface'
/**
 * Character interface: Defines public methods exposed by character
 *
 * This is behavior contract (Contract Model), defines abilities character should have
 *
 * Design concept:
 * - Composition over inheritance: Through combination of multiple responsibility interfaces
 * - Interface segregation principle: Each sub-interface has single responsibility, avoids implementing unnecessary methods
 * - Dependency inversion principle: High-level modules depend on this interface, not concrete implementations
 */
export interface ICharacter extends IEntity, IAttributeProvider, IEffectOwner, IUltimateOwner {
  /** Create character snapshot (for replay, log recording) */
  createSnapshot(): CharacterSnapshot
}
// Re-export type aliases (maintain backward compatibility)
export type { CharacterId, CharacterSnapshot }
