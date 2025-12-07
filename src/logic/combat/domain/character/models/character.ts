import { type CharacterSnapshot, type IEntity } from '@/logic/combat/infra/shared'
import type { IAttributeOwner } from '../../attribute'
import type { IEffectOwner } from './effect-owner'
import type { IItemOwner } from './item-owner'
import type { IUltimateOwner } from './ultimate-owner'
/**
 * 角色介面：定義角色公開的方法
 *
 * 這是行為契約（契約模型），定義角色應具備的能力
 *
 * 設計理念：
 * - 優先組合而非繼承：透過多個職責介面的組合
 * - 介面隔離原則：每個子介面只負責單一職責，避免實作不必要的方法
 * - 依賴反轉原則：高層模組依賴此介面，而非具體實作
 */
export interface ICharacter extends IEntity, IAttributeOwner, IEffectOwner, IItemOwner, IUltimateOwner {
  createSnapshot(): CharacterSnapshot
}
