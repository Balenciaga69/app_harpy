import type { CombatContext } from '../core/CombatContext'
import type { ICharacter } from '../character/models/character.model'
import type { ICombatHook } from '../effect/models/effect.model'
import type { DamageEvent } from './models/damageEvent.model'
import { calculateArmorReduction, calculateHitChance, applyCritMultiplier } from './utils/damageCalculator.util'
/**
 * 傷害責任鏈
 *
 * 負責協調完整的傷害計算流程：
 * 1. 收集所有相關的 Hook
 * 2. 依序執行各階段
 * 3. 應用傷害並觸發後續效果
 *
 * 設計原則：
 * - 只負責協調流程，不包含具體邏輯
 * - 所有效果邏輯都在 Effect 實作中
 * - 遵循開放封閉原則（新增效果不需修改此類）
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
    // 【階段4】傷害修飾階段
    event = this.damageModify(event, allHooks)
    // 【階段5】防禦計算階段
    event = this.defenseCalculation(event, allHooks)
    // 【階段6】最終確認階段
    event = this.beforeApply(event, allHooks)
    if (event.prevented) {
      this.emitPreventedEvent(event)
      return // 被阻止，結束流程
    }
    // 應用傷害
    this.applyDamage(event)
    // 【階段7】傷害應用後
    this.afterApply(event, allHooks)
  }
  /**
   * 收集角色身上所有效果的 Hook
   */
  private collectHooks(character: ICharacter): ICombatHook[] {
    const effects = character.effects.getAllEffects()
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
    // 如果 Hook 沒有設定 isHit，則使用預設邏輯
    if (event.isHit === undefined) {
      const accuracy = event.source.attributes.get('accuracy')
      const evasion = event.target.attributes.get('evasion')
      const hitChance = calculateHitChance(accuracy, evasion)
      event.isHit = this.context.rng.next() < hitChance
      event.evaded = !event.isHit
    }
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
    // 如果 Hook 沒有設定 isCrit，則使用預設邏輯
    if (event.isCrit === undefined && event.tags.has('attack')) {
      const critChance = event.source.attributes.get('criticalChance')
      event.isCrit = this.context.rng.next() < critChance
    }
    // 如果暴擊，套用暴擊倍率（暫時使用固定 1.5 倍，未來可從屬性讀取）
    if (event.isCrit) {
      event.finalDamage = applyCritMultiplier(event.baseDamage, 1.5)
    } else {
      event.finalDamage = event.baseDamage
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
  /** 【階段5】防禦計算階段 */
  private defenseCalculation(event: DamageEvent, hooks: ICombatHook[]): DamageEvent {
    // 先執行 Hook（可能會修改護甲計算）
    for (const hook of hooks) {
      if (hook.onDefenseCalculation) {
        event = hook.onDefenseCalculation(event, this.context)
      }
    }
    // 如果 Hook 沒有設定 armorReduction，則使用預設邏輯
    if (event.armorReduction === undefined) {
      const armor = event.target.attributes.get('armor')
      event.armorReduction = calculateArmorReduction(armor, event.baseDamage)
    }
    // 套用護甲減免
    event.finalDamage = event.finalDamage * (1 - event.armorReduction)
    return event
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
    const currentHp = event.target.attributes.get('currentHp')
    const newHp = Math.max(0, currentHp - event.finalDamage)
    event.target.attributes.setCurrentHp(newHp)
    // 發送傷害事件
    this.context.eventBus.emit('entity:damage', {
      targetId: event.target.id,
      amount: event.finalDamage,
      sourceId: event.source.id,
    })
    // 檢查是否死亡
    if (newHp <= 0 && !event.target.isDead) {
      event.target.markDead()
      this.context.eventBus.emit('entity:death', {
        targetId: event.target.id,
      })
    }
  }
  /** 發送未命中事件 */
  private emitMissEvent(event: DamageEvent): void {
    // TODO: 新增 'combat:miss' 事件到 CombatEventMap
    // 暫時不輸出，避免 eslint 錯誤
    void event
  }
  /** 發送被阻止事件 */
  private emitPreventedEvent(event: DamageEvent): void {
    // TODO: 新增 'combat:prevented' 事件到 CombatEventMap
    // 暫時不輸出，避免 eslint 錯誤
    void event
  }
}
