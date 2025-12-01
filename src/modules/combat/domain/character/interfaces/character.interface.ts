import { type IEntity, type CharacterId, type CharacterSnapshot } from '@/modules/combat/infra/shared'
import type { IAttributeProvider } from './attribute.provider.interface'
import type { IEffectOwner } from './effect.owner.interface'
import type { IUltimateOwner } from './ultimate.owner.interface'
/**
 * 角色介面：定義角色對外的公開方法
 *
 * 這是行為契約 (Contract Model)，定義角色應具備的能力
 *
 * 設計理念：
 * - 組合優於繼承：透過組合多個職責介面
 * - 介面隔離原則：每個子介面職責單一，避免實作不需要的方法
 * - 依賴反轉原則：高層模組依賴此介面，而非具體實作
 */
export interface ICharacter extends IEntity, IAttributeProvider, IEffectOwner, IUltimateOwner {
  /** 創建角色快照（用於回放、日誌記錄） */
  createSnapshot(): CharacterSnapshot
}
// 重新導出型別別名（保持向後兼容）
export type { CharacterId, CharacterSnapshot }
