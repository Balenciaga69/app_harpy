import { type CharacterSnapshot, type IEntity } from '../../../shared'
import type { IAttributeOwner } from './IAttributeOwner'
import type { IEffectOwner } from './IEffectOwner'
import type { IUltimateOwner } from './IUltimateOwner'

export interface ICharacter extends IEntity, IAttributeOwner, IEffectOwner, IUltimateOwner {
  createSnapshot(): CharacterSnapshot
}

