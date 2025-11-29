import { nanoid } from 'nanoid'
import { EffectManager } from '../effect/EffectManager'
import { AttributeContainer } from './AttributeContainer'
import type { BaseAttributeValues } from './models/attribute.model'
import type { CharacterId, ICharacter } from './models/character.model'
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
  // 標記角色為死亡
  public markDead(): void {
    this.isDead = true
  }
  // 讓角色復活
  public revive(): void {
    this.isDead = false
  }
}
