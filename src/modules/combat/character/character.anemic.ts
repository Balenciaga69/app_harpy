import { nanoid } from 'nanoid'
import type { BaseAttributeValues, CharacterId, ICharacter } from '.'
import { EffectManager } from '../effect/EffectManager'
import { AttributeContainer } from './attribute.container'
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: ICharacter['team']
}
export class Character implements ICharacter {
  readonly id: CharacterId
  readonly name: string
  readonly attributes: AttributeContainer
  readonly effects: EffectManager
  readonly team: ICharacter['team']
  isDead: boolean = false
  constructor(config: CharacterConfig) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    this.attributes = new AttributeContainer(config.baseAttributes)
    this.effects = new EffectManager(this)
  }
}
