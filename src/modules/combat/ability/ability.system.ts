import type { CharacterId, ICharacter } from '../character'
import type { CombatContext } from '../context'
import { DamageChain } from '../damage'
import { isCharacter } from '../shared'
import { DamageFactory } from './factories'
import { AttackType } from './models'
import { ElementEffectRegistry } from './registries'
import { FirstAliveSelector, type ITargetSelector } from './strategies'
/**
 * AbilitySystem：角色攻擊行為協調系統。
 *
 * 設計理念：
 * - 作為攻擊流程的編排者，協調目標選擇、傷害計算、效果施加等環節。
 * - 採用策略模式實現可插拔的目標選擇邏輯，支援運行時切換選擇策略。
 * - 使用工廠模式統一管理傷害事件創建，集中化攻擊類型與傷害分配邏輯。
 * - 通過註冊表配置化元素效果施加，支援數據驅動的效果觸發機制。
 * - 基於 Tick 驅動，在每個時間單位檢查並執行角色的攻擊行為。
 *
 * 主要職責：
 * - 監聽 tick:start 事件，驅動角色攻擊邏輯。
 * - 管理每個角色的攻擊冷卻時間，確保攻擊頻率符合屬性設定。
 * - 使用目標選擇策略從敵方陣營中選擇攻擊目標。
 * - 透過 DamageFactory 創建傷害事件，並委託 DamageChain 執行傷害計算。
 * - 根據傷害類型透過 ElementEffectRegistry 施加對應的元素效果。
 * - 發布 entity:attack 事件，通知系統攻擊行為發生。
 * - 提供清理機制，在系統卸載時移除事件監聽與釋放資源。
 */
export class AbilitySystem {
  private context: CombatContext
  private damageChain: DamageChain
  private targetSelector: ITargetSelector
  private damageFactory: DamageFactory
  private effectRegistry: ElementEffectRegistry
  /** 追蹤每個角色的下次攻擊時間 (以 Tick 為單位) */
  private nextAttackTick: Map<CharacterId, number> = new Map()
  private tickHandler: () => void
  constructor(context: CombatContext, targetSelector?: ITargetSelector) {
    this.context = context
    this.damageChain = new DamageChain(context)
    this.targetSelector = targetSelector ?? new FirstAliveSelector()
    this.damageFactory = new DamageFactory()
    this.effectRegistry = new ElementEffectRegistry()
    this.tickHandler = () => this.processTick()
    this.registerEventListeners()
  }
  /** 設置目標選擇策略（允許運行時切換） */
  setTargetSelector(selector: ITargetSelector): void {
    this.targetSelector = selector
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
      if (!isCharacter(entity)) return
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
    // 1. 獲取候選目標
    const enemyTeam = character.team === 'player' ? 'enemy' : 'player'
    const enemies = this.context.getEntitiesByTeam(enemyTeam)
    const aliveEnemies = enemies.filter((e) => {
      return isCharacter(e) && !(e as ICharacter).isDead
    }) as ICharacter[]
    // 2. 使用策略選擇目標
    const target = this.targetSelector.selectTarget(character, aliveEnemies)
    if (!target) return
    // 3. 發送攻擊事件
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      tick: currentTick,
    })
    // 4. 使用工廠創建傷害事件（默認近戰物理攻擊）
    const damageEvent = this.damageFactory.createDamageEvent(character, target, AttackType.MeleePhysical, currentTick)
    // 5. 觸發傷害計算
    this.damageChain.execute(damageEvent)
    // 6. 使用註冊表施加元素效果
    this.effectRegistry.applyEffects(damageEvent, this.context)
    // 7. 更新下次攻擊時間
    this.updateCooldown(character, currentTick)
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
