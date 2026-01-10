import { IEffectServices } from './IEffectServices'
/**
 * Effect 生命週期鉤子
 *
 * 定義 Effect 的生命週期事件。
 * 使用基礎服務介面，支援戰鬥內外使用。
 */
export interface IEffectLifeHook {
  /**
   * 當效果被應用到角色時觸發
   * 用於初始化（例如：應用屬性修飾器）
   */
  onApply?(characterId: string, services: IEffectServices): void
  /**
   * 當效果從角色移除時觸發
   * 用於清理（例如：移除屬性修飾器）
   */
  onRemove?(characterId: string, services: IEffectServices): void
}
/**
 * 角色狀態鉤子
 *
 * 定義角色狀態變化的回應。
 * 使用基礎服務介面，支援戰鬥內外使用。
 */
export interface ICharacterStateHook {
  /**
   * 當角色復活時觸發
   * 用於復活後觸發的效果（例如：復活後獲得增益）
   */
  onRevive?(characterId: string, services: IEffectServices): void
  /**
   * 當角色血量歸零時觸發（死亡檢查前）
   * 用於死亡觸發效果（例如：死亡時爆炸造成真實傷害）
   * 注意：此時角色可能仍會復活
   */
  onHpZero?(characterId: string, services: IEffectServices): void
}
/**
 * 戰鬥專屬鉤子
 *
 * 定義戰鬥中的周期性事件。
 * 使用戰鬥專屬服務介面，僅在戰鬥內使用。
 */
export interface ICombatEffectHook {
  /**
   * 每個戰鬥 tick 觸發一次
   * 用於周期性效果（例如：中毒傷害、層數衰減）
   */
  onTick?(characterId: string, services: IEffectServices): void
}
