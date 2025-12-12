import { type CharacterSnapshot, type IEntity } from '../../../shared'
import type { IAttributeOwner } from './attribute-owner'
import type { IEffectOwner } from './effect-owner'
import type { IUltimateOwner } from './ultimate-owner'

export interface ICharacter extends IEntity, IAttributeOwner, IEffectOwner, IUltimateOwner {
  createSnapshot(): CharacterSnapshot
}
