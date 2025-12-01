import type { IEntity } from '@/modules/combat/infra/shared'
import type { IAttributeProvider } from './attribute.provider.interface'
import type { IEffectOwner } from './effect.owner.interface'
import type { IUltimateOwner } from './ultimate.owner.interface'
// 角色 ID（簡單 alias）
export type CharacterId = string
/** 定義角色對外的公開方法 (組合優於繼承)  */
export interface ICharacter extends IEntity, IAttributeProvider, IEffectOwner, IUltimateOwner {}
