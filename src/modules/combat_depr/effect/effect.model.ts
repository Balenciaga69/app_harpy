import type { EffectType, EffectData } from './effect.type'
/**
 * 效果實體 - 單個效果的生命週期管理
 */
export class Effect implements EffectData {
  public readonly id: string
  public readonly type: EffectType
  public layers: number
  public readonly appliedAt: number
  public expireAt: number
  public maxHpIncreased: number = 0
  constructor(id: string, type: EffectType, layers: number, appliedAt: number, expireAt: number) {
    this.id = id
    this.type = type
    this.layers = layers
    this.appliedAt = appliedAt
    this.expireAt = expireAt
  }
  /**
   * 檢查效果是否已過期
   */
  public isExpired(currentTick: number): boolean {
    return this.expireAt !== -1 && currentTick >= this.expireAt
  }
  /**
   * 增加層數
   */
  public addLayers(amount: number, maxLayers?: number): void {
    this.layers += amount
    if (maxLayers !== undefined) {
      this.layers = Math.min(this.layers, maxLayers)
    }
  }
  /**
   * 減少層數
   */
  public removeLayers(amount: number): void {
    this.layers = Math.max(0, this.layers - amount)
  }
}
/**
 * 效果管理器 - 管理單個角色的所有效果
 */
export class EffectManager {
  private effects: Map<string, Effect> = new Map()
  /**
   * 添加效果
   */
  public addEffect(effect: Effect): void {
    this.effects.set(effect.id, effect)
  }
  /**
   * 移除效果
   */
  public removeEffect(effectId: string): void {
    this.effects.delete(effectId)
  }
  /**
   * 根據 ID 獲取效果
   */
  public getEffect(effectId: string): Effect | undefined {
    return this.effects.get(effectId)
  }
  /**
   * 根據類型獲取所有效果
   */
  public getEffectsByType(type: EffectType): Effect[] {
    return Array.from(this.effects.values()).filter((e) => e.type === type)
  }
  /**
   * 獲取所有效果
   */
  public getAllEffects(): Effect[] {
    return Array.from(this.effects.values())
  }
  /**
   * 清理過期效果
   */
  public cleanupExpiredEffects(currentTick: number): void {
    const expiredIds: string[] = []
    for (const [id, effect] of this.effects) {
      if (effect.isExpired(currentTick)) {
        expiredIds.push(id)
      }
    }
    expiredIds.forEach((id) => this.removeEffect(id))
  }
  /**
   * 檢查是否存在指定類型的效果
   */
  public hasEffectType(type: EffectType): boolean {
    return Array.from(this.effects.values()).some((e) => e.type === type)
  }
  /**
   * 獲取指定類型效果的總層數
   */
  public getTotalLayers(type: EffectType): number {
    return Array.from(this.effects.values())
      .filter((e) => e.type === type)
      .reduce((sum, e) => sum + e.layers, 0)
  }
  /**
   * 清空所有效果
   */
  public clear(): void {
    this.effects.clear()
  }
}
