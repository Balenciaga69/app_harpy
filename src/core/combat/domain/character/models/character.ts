import { type CharacterSnapshot, type IEntity } from '@/core/combat/infra/shared'
import type { IAttributeOwner } from '../../attribute'
import type { IEffectOwner } from './effect-owner'
import type { IItemOwner } from './item-owner'
import type { IUltimateOwner } from './ultimate-owner'
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
export interface ICharacter extends IEntity, IAttributeOwner, IEffectOwner, IItemOwner, IUltimateOwner {
  /** Create character snapshot (for replay, log recording) */
  createSnapshot(): CharacterSnapshot
}
