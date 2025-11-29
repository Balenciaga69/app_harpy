import type { CharacterStats } from '../shared/types/stats.type'
import { EffectCalculator } from '../effect/effectCalculator.util'
import type { EffectModifier } from '../effect/effect.type'
import { EffectManager } from '../effect/effect.model'
/** 戰鬥中的角色實體 - 管理動態狀態與行為 */
export class Character {
  public readonly id: string
  public readonly stats: CharacterStats
  public currentHp: number
  private effectManager: EffectManager
  private cachedModifier: EffectModifier | null = null
  private lastModifierTick: number = -1
  constructor(stats: CharacterStats, id: string) {
    this.id = id
    this.stats = stats
    this.currentHp = this.getTotalHp()
    this.effectManager = new EffectManager()
  }
  /** 獲取效果管理器 */
  public getEffectManager(): EffectManager {
    return this.effectManager
  }
  /** 計算總 HP（基礎 + 裝備 + 效果加成）*/
  public getTotalHp(): number {
    const baseHp = this.stats.hp + this.stats.gears.reduce((sum, g) => sum + g.hp, 0)
    const modifier = this.getEffectModifier()
    return Math.floor(baseHp * (1 + modifier.maxHpIncreasePercent))
  }
  /** 獲取效果修飾 */
  private getEffectModifier(currentTick?: number): EffectModifier {
    if (currentTick !== undefined && currentTick === this.lastModifierTick && this.cachedModifier) {
      return this.cachedModifier
    }
    const effects = this.effectManager.getAllEffects()
    const modifier = EffectCalculator.calculateTotalModifier(effects)
    if (currentTick !== undefined) {
      this.cachedModifier = modifier
      this.lastModifierTick = currentTick
    }
    return modifier
  }
  /** 受到傷害 */
  public takeDamage(amount: number): void {
    this.currentHp = Math.max(0, this.currentHp - amount)
  }
  /** 治療 */
  public heal(amount: number): void {
    const maxHp = this.getTotalHp()
    this.currentHp = Math.min(maxHp, this.currentHp + amount)
  }
  /** 是否死亡 */
  public isDead(): boolean {
    return this.currentHp <= 0
  }
  /** 計算總閃避（基礎 + 裝備 + 效果） */
  public getTotalEvasion(): number {
    const baseEvasion = this.stats.evasion + this.stats.gears.reduce((sum, g) => sum + g.evasion, 0)
    const modifier = this.getEffectModifier()
    return Math.floor(baseEvasion * (1 - modifier.accuracyReduction))
  }
  /** 計算總護甲（基礎 + 裝備）*/
  public getTotalArmor(): number {
    return this.stats.armor + this.stats.gears.reduce((sum, g) => sum + g.armor, 0)
  }
  /** 計算攻擊速度修飾（基於冰緩和充能效果） */
  public getAttackSpeedModifier(currentTick?: number): number {
    const modifier = this.getEffectModifier(currentTick)
    return modifier.attackSpeedPercent
  }
  /** 獲取火傷害加成 */
  public getFireDamageBoost(currentTick?: number): number {
    const modifier = this.getEffectModifier(currentTick)
    return modifier.damageBoostByType['fire'] ?? 0
  }
  /** 清理過期效果 */
  public cleanupExpiredEffects(currentTick: number): void {
    this.effectManager.cleanupExpiredEffects(currentTick)
    this.cachedModifier = null // 清除緩存
  }
}
