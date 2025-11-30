import type { ICharacter } from '../character'
import type { CombatContext } from '../context/combat.context'
import { type DamageEvent, calculateTotalDamage, type ICombatHook } from './models'
import { calculateHitChance } from './utils/damage.calculator.util'
/**
 * DamageChain：協調傷害計算流程的責任鏈。
 *
 * 設計理念：
 * - 將完整的傷害計算過程分為明確階段，並協調 Hook 的執行順序。
 * - 僅負責流程協調，不直接承擔具體效果或傷害邏輯，實現低耦合。
 * - 支援 ICombatHook 的擴展，允許各種效果在不同階段介入流程。
 * - 遵循開放封閉原則：添加新效果不需修改本類。
 *
 * 主要職責：
 * - 收集來自攻擊方與防守方的 Hook，並在各個階段中呼叫 Hook。
 * - 管理命中、暴擊、傷害修飾、防禦計算與應用等關鍵階段的流程。
 * - 在完成計算後，應用傷害並發出相關事件（如 entity:damage、entity:death）。
 */
export class DamageChain {
  private context: CombatContext
  constructor(context: CombatContext) {
    this.context = context
  }
  /**
   * 執行完整的傷害計算流程
   */
  execute(event: DamageEvent): void {
    // 收集所有相關的 Hook
    const sourceHooks = this.collectHooks(event.source)
    const targetHooks = this.collectHooks(event.target)
    const allHooks = [...sourceHooks, ...targetHooks]
    // 【階段1】傷害發起階段
    event = this.beforeCalculation(event, allHooks)
    // 【階段2】命中判定階段
    event = this.hitCheck(event, allHooks)
    if (!event.isHit) {
      this.emitMissEvent(event)
      return // 未命中，結束流程
    }
    // 【階段3】暴擊判定階段
    event = this.critCheck(event, allHooks)
    // 【階段4】傷害修飾階段 (Effect 可以在這裡轉換元素類型)
    event = this.damageModify(event, allHooks)
    // 【階段5】防禦計算階段 (分別計算每種元素的抗性)
    event = this.defenseCalculation(event, allHooks)
    // 【階段6】最終確認階段
    event = this.beforeApply(event, allHooks)
    if (event.prevented) {
      this.emitPreventedEvent(event)
      return // 被阻止，結束流程
    }
    // 計算最終總傷害
    event.finalDamage = calculateTotalDamage(event.damages)
    // 應用傷害
    this.applyDamage(event)
    // 【階段7】傷害應用後
    this.afterApply(event, allHooks)
  }
  /**
   * 收集角色身上所有效果的 Hook
   */
  private collectHooks(character: ICharacter): ICombatHook[] {
    const effects = character.getAllEffects()
    const hooks: ICombatHook[] = []
    for (const effect of effects) {
      // 檢查是否實作了任何 Hook 方法
      if (
        'beforeDamageCalculation' in effect ||
        'onHitCheck' in effect ||
        'onCritCheck' in effect ||
        'onDamageModify' in effect ||
        'onDefenseCalculation' in effect ||
        'beforeDamageApply' in effect ||
        'afterDamageApply' in effect
      ) {
        hooks.push(effect as unknown as ICombatHook)
      }
    }
    return hooks
  }
  /** 【階段1】傷害發起階段 */
  private beforeCalculation(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    for (const hook of hooks) {
      if (hook.beforeDamageCalculation) {
        event = hook.beforeDamageCalculation(event, this.context)
      }
    }
    return event
  }
  /** 【階段2】命中判定階段 */
  private hitCheck(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    // 先執行 Hook（可能會修改命中判定）
    for (const hook of hooks) {
      if (hook.onHitCheck) {
        event = hook.onHitCheck(event, this.context)
      }
    }
    // 如果 Hook 沒有明確設定命中結果，使用預設邏輯
    const accuracy = event.source.getAttribute('accuracy')
    const evasion = event.target.getAttribute('evasion')
    const hitChance = calculateHitChance(accuracy, evasion)
    event.isHit = this.context.rng.next() < hitChance
    event.evaded = !event.isHit
    return event
  }
  /** 【階段3】暴擊判定階段 */
  private critCheck(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    // 先執行 Hook
    for (const hook of hooks) {
      if (hook.onCritCheck) {
        event = hook.onCritCheck(event, this.context)
      }
    }
    // 如果是攻擊，進行暴擊判定
    if (event.tags.has('attack')) {
      const critChance = event.source.getAttribute('criticalChance') ?? 0
      event.isCrit = this.context.rng.next() < critChance
    }
    // 如果暴擊，對所有元素傷害套用暴擊倍率
    if (event.isCrit) {
      const critMultiplier = event.source.getAttribute('criticalMultiplier') ?? 1.5
      event.damages.physical *= critMultiplier
      event.damages.fire *= critMultiplier
      event.damages.ice *= critMultiplier
      event.damages.lightning *= critMultiplier
      event.damages.poison *= critMultiplier
      event.damages.chaos *= critMultiplier
      // 發送暴擊事件
      this.context.eventBus.emit('entity:critical', {
        sourceId: event.source.id,
        targetId: event.target.id,
        multiplier: critMultiplier,
        tick: event.tick,
      })
    }
    return event
  }
  /** 【階段4】傷害修飾階段 */
  private damageModify(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    for (const hook of hooks) {
      if (hook.onDamageModify) {
        event = hook.onDamageModify(event, this.context)
      }
    }
    return event
  }
  /** 【階段5】防禦計算階段 - 分別計算每種元素的抗性 */
  private defenseCalculation(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    // 先執行 Hook（可能會修改防禦計算）
    for (const hook of hooks) {
      if (hook.onDefenseCalculation) {
        event = hook.onDefenseCalculation(event, this.context)
      }
    }
    // TODO: 未來實作分別的元素抗性
    // 目前暫時只處理物理護甲
    const armor = event.target.getAttribute('armor')
    const armorReduction = this.calculateArmorReduction(armor)
    // 只對物理傷害應用護甲減免
    event.damages.physical *= 1 - armorReduction
    return event
  }
  /** 計算護甲減免百分比 */
  private calculateArmorReduction(armor: number): number {
    // 簡化公式: 減免% = armor / (armor + 100)
    // 例如: 50護甲 = 33%減免, 100護甲 = 50%減免
    return armor / (armor + 100)
  }
  /** 【階段6】最終確認階段 */
  private beforeApply(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    for (const hook of hooks) {
      if (hook.beforeDamageApply) {
        event = hook.beforeDamageApply(event, this.context)
      }
    }
    return event
  }
  /** 【階段7】傷害應用後 */
  private afterApply(event: DamageEvent, hooks: ICombatHook[]): void {
    for (const hook of hooks) {
      if (hook.afterDamageApply) {
        hook.afterDamageApply(event, this.context)
      }
    }
  }
  /** 應用傷害（扣除 HP） */
  private applyDamage(event: DamageEvent): void {
    const currentHp = event.target.getAttribute('currentHp')
    const newHp = Math.max(0, currentHp - event.finalDamage)
    event.target.setCurrentHpClamped(newHp)
    // 發送傷害事件
    this.context.eventBus.emit('entity:damage', {
      targetId: event.target.id,
      amount: event.finalDamage,
      sourceId: event.source.id,
    })
    // 檢查是否死亡
    if (newHp <= 0 && !event.target.isDead) {
      event.target.isDead = true
      this.context.eventBus.emit('entity:death', {
        targetId: event.target.id,
      })
    }
  }
  /** 發送未命中事件 */
  private emitMissEvent(event: DamageEvent): void {
    this.context.eventBus.emit('combat:miss', {
      sourceId: event.source.id,
      targetId: event.target.id,
      tick: event.tick,
    })
  }
  /** 發送被阻止事件 */
  private emitPreventedEvent(event: DamageEvent): void {
    this.context.eventBus.emit('combat:prevented', {
      sourceId: event.source.id,
      targetId: event.target.id,
      reason: 'damage-prevented-by-effect',
      tick: event.tick,
    })
  }
}
