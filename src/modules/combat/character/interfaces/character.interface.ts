import type { EffectManager } from '../../effect/EffectManager'
import type { IEntity } from '../../shared'
import type { AttributeContainer } from '../attribute.container' // 角色 ID（簡單 alias）

export type CharacterId = string
export interface ICharacter extends IEntity {
  readonly attributes: AttributeContainer
  readonly effects: EffectManager
  // 裝備引用 (後續擴展)
  //   readonly equipment?: IEquipment TODO:
  //   readonly weapon?: IWeapon TODO:
}
