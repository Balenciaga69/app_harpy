import type { EffectManager } from "../../effect/EffectManager"
import type { IEntity } from "../../shared"
import type { AttributeContainer } from "../AttributeContainer"

// 角色 ID（簡單 alias）
export type CharacterId = string
// 角色類型
// 角色介面 (Entity)
export interface ICharacter extends IEntity {
  // Component 引用
  readonly attributes: AttributeContainer
  readonly effects: EffectManager
  // 方法
  markDead(): void
  revive(): void
  // 裝備引用 (後續擴展)
  //   readonly equipment?: IEquipment TODO:
  //   readonly weapon?: IWeapon TODO:
}
