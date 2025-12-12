import type { CharacterSnapshot } from '../shared/CharacterSnapshot'
import type { IEntity } from '../shared/IEntity'
import type { IAttributeOwner } from './IAttributeOwner'
import type { IEffectOwner } from './IEffectOwner'
import type { IUltimateOwner } from './IUltimateOwner'
export interface ICharacter extends IEntity, IAttributeOwner, IEffectOwner, IUltimateOwner {
  createSnapshot(): CharacterSnapshot
}
