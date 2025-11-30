import type { CombatContext } from '../context/combat.context'
import type { ICharacter } from '../character/interfaces/character.interface'
import type { CharacterId } from '../character/interfaces/character.interface'
import type { DamageEvent } from '../damage/models/damage.event.model'
import { createEmptyDamages } from '../damage/models/damage.event.model'
import { DamageChain } from '../damage/damage.chain'
import { HolyFireEffect, ChargeEffect, ChillEffect, PoisonEffect } from '../effect/Implementation'
/**
 * 能力系統
 *
 * - 負責協調角色的攻擊行為：
 *    - 追蹤每個角色的攻擊冷卻時間
 *    - 選擇攻擊目標
 *    - 觸發傷害計算 (調用 DamageChain)
 *    - 施加元素效果
 */
export class AbilitySystem {
  private context: CombatContext
  private damageChain: DamageChain
  /** 追蹤每個角色的下次攻擊時間 (以 Tick 為單位) */
  private nextAttackTick: Map<CharacterId, number> = new Map()
  private tickHandler: () => void
  constructor(context: CombatContext) {
    this.context = context
    this.damageChain = new DamageChain(context)
    this.tickHandler = () => this.processTick()
    this.registerEventListeners()
  }
  /** 註冊事件監聽 */
  private registerEventListeners(): void {
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** 處理每個 Tick 的能力邏輯 */
  private processTick(): void {
    const currentTick = this.context.getCurrentTick()
    const allEntities = this.context.getAllEntities()
    // 遍歷所有實體
    allEntities.forEach((entity) => {
      // 只處理角色
      if (!this.context.isCharacter(entity)) return
      const character = entity as ICharacter
      // 跳過已死亡的角色
      if (character.isDead) return
      // 檢查是否可以攻擊
      if (this.canAttack(character, currentTick)) {
        this.performAttack(character, currentTick)
      }
    })
  }
  /** 檢查角色是否可以攻擊 */
  private canAttack(character: ICharacter, currentTick: number): boolean {
    const nextAttack = this.nextAttackTick.get(character.id)
    // 如果沒有記錄,設置隨機初始延遲 (0 ~ 冷卻時間)
    if (nextAttack === undefined) {
      const cooldown = character.getAttribute('attackCooldown')
      const randomDelay = Math.floor(this.context.rng.next() * cooldown)
      this.nextAttackTick.set(character.id, currentTick + randomDelay)
      return false
    }
    // 檢查是否已經過了冷卻時間
    return currentTick >= nextAttack
  }
  /** 執行攻擊 */
  private performAttack(character: ICharacter, currentTick: number): void {
    // 1. 選擇目標
    const target = this.selectTarget(character)
    if (!target) return // 沒有可攻擊的目標
    // 2. 發送攻擊事件
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      tick: currentTick,
    })
    // 3. 創建傷害事件
    const damageEvent = this.createDamageEvent(character, target, currentTick)
    // 4. 觸發傷害計算
    this.damageChain.execute(damageEvent)
    // 5. 施加元素效果 (攻擊後,根據造成的傷害類型)
    this.applyElementalEffects(damageEvent)
    // 6. 更新下次攻擊時間
    this.updateCooldown(character, currentTick)
  }
  /** 選擇攻擊目標 */
  private selectTarget(attacker: ICharacter): ICharacter | null {
    // 確定敵對隊伍
    const enemyTeam = attacker.team === 'player' ? 'enemy' : 'player'
    // 獲取所有敵對實體
    const enemies = this.context.getEntitiesByTeam(enemyTeam)
    // 過濾出還活著的角色
    const aliveEnemies = enemies.filter((e) => {
      return this.context.isCharacter(e) && !(e as ICharacter).isDead
    }) as ICharacter[]
    // 簡化版：攻擊第一個存活的敵人
    return aliveEnemies[0] ?? null
  }
  /** 創建傷害事件 */
  private createDamageEvent(source: ICharacter, target: ICharacter, tick: number): DamageEvent {
    const baseDamage = source.getAttribute('attackDamage') ?? 0
    // 創建基礎物理傷害
    const damages = createEmptyDamages()
    damages.physical = baseDamage
    return {
      source,
      target,
      damages,
      finalDamage: 0, // 會在 DamageChain 中計算
      tags: new Set(['attack', 'melee']),
      isCrit: false,
      isHit: true,
      evaded: false,
      tick,
      prevented: false,
    }
  }
  /** 施加元素效果 - 根據造成的傷害類型必定觸發對應狀態 */
  private applyElementalEffects(damageEvent: DamageEvent): void {
    const target = damageEvent.target
    // 只有命中才施加效果
    if (!damageEvent.isHit || damageEvent.prevented) return
    // 火焰傷害 → 聖火效果
    if (damageEvent.damages.fire > 0) {
      target.addEffect(new HolyFireEffect(), this.context)
    }
    // 冰霜傷害 → 冰緩效果
    if (damageEvent.damages.ice > 0) {
      target.addEffect(new ChillEffect(), this.context)
    }
    // 閃電傷害 → 充能效果
    if (damageEvent.damages.lightning > 0) {
      target.addEffect(new ChargeEffect(), this.context)
    }
    // 毒傷害 → 中毒效果
    if (damageEvent.damages.poison > 0) {
      target.addEffect(new PoisonEffect(), this.context)
    }
  }
  /** 更新攻擊冷卻時間 */
  private updateCooldown(character: ICharacter, currentTick: number): void {
    // 獲取攻擊冷卻時間（單位：Tick）
    const cooldown = character.getAttribute('attackCooldown')
    // 計算下次可以攻擊的 Tick
    const nextAttack = currentTick + cooldown
    // 更新記錄
    this.nextAttackTick.set(character.id, nextAttack)
  }
  /** 清理系統（移除事件監聽） */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
    this.nextAttackTick.clear()
  }
}
