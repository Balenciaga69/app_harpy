import type { CharacterId, ICharacter } from '../character'
import type { CombatContext } from '../context'
import { DamageChain } from '../damage'
import { isCharacter } from '../shared'
import { DamageFactory } from './factories'
import { FirstAliveSelector, type ITargetSelector } from './strategies'
/**
 * AbilitySystem：角色攻擊行為協調系統
 *
 * 設計理念：
 * - v0.3 移除元素系統，改為能量/大招機制
 * - 普通攻擊累積能量，能量滿時可釋放大招
 * - 採用策略模式實現可插拔的目標選擇邏輯
 * - 基於 Tick 驅動，cooldown 單位為 tick
 *
 * 主要職責：
 * - 監聽 tick:start 事件，驅動角色攻擊邏輯
 * - 管理每個角色的攻擊冷卻時間（cooldown）
 * - 使用目標選擇策略從敵方陣營中選擇攻擊目標
 * - 透過 DamageFactory 創建傷害事件
 * - 委託 DamageChain 執行傷害計算
 * - 管理能量累積與大招釋放邏輯
 * - 發布 entity:attack 與 entity:ultimate 事件
 */
export class AbilitySystem {
  private context: CombatContext
  private damageChain: DamageChain
  private targetSelector: ITargetSelector
  private damageFactory: DamageFactory
  /** 追蹤每個角色的下次攻擊 Tick */
  private nextAttackTick: Map<CharacterId, number> = new Map()
  private tickHandler: () => void
  constructor(context: CombatContext, targetSelector?: ITargetSelector) {
    this.context = context
    this.damageChain = new DamageChain(context)
    this.targetSelector = targetSelector ?? new FirstAliveSelector()
    this.damageFactory = new DamageFactory()
    this.tickHandler = () => this.processTick()
    this.registerEventListeners()
  }
  /** 設置目標選擇策略 */
  setTargetSelector(selector: ITargetSelector): void {
    this.targetSelector = selector
  }
  /** 註冊事件監聽 */
  private registerEventListeners(): void {
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** 處理每個 Tick 的能力邏輯 */
  // TODO: 這邊可以學 DamageChain 的架構，拆分成多個小方法
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
      // 能量自然回復（每 100 tick 觸發一次）
      this.processEnergyRegen(character, currentTick)
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
    // 3. 檢查是否能釋放大招 // TODO: 這段有點複雜，可以考慮獨立成方法甚至類別或其他架構
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? 100
    const canUseUltimate = currentEnergy >= maxEnergy
    if (canUseUltimate) {
      // 釋放大招
      this.performUltimate(character, target, currentTick)
    } else {
      // 普通攻擊
      this.performNormalAttack(character, target, currentTick)
    }
    // 4. 更新下次攻擊時間
    this.updateCooldown(character, currentTick)
  }
  /** 執行普通攻擊 */
  private performNormalAttack(character: ICharacter, target: ICharacter, currentTick: number): void {
    // 發送攻擊事件
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      tick: currentTick,
    })
    // 創建普通攻擊傷害事件
    const damageEvent = this.damageFactory.createAttackEvent(character, target, currentTick)
    // 執行傷害計算
    this.damageChain.execute(damageEvent)
    // 普通攻擊成功後累積能量
    if (damageEvent.isHit && !damageEvent.prevented) {
      const energyGain = character.getAttribute('energyGainOnAttack') ?? 0
      if (energyGain > 0) {
        this.gainEnergy(character, energyGain)
      }
    }
  }
  /** 執行大招 */
  private performUltimate(character: ICharacter, _target: ICharacter, _currentTick: number): void {
    // 先消耗能量
    character.setBaseAttribute('currentEnergy', 0)
    // 檢查角色是否有大招
    const ultimate = character.getUltimate()
    if (!ultimate) {
      // 如果沒有大招，使用默認大招邏輯（向後兼容）
      this.performDefaultUltimate(character, _target, _currentTick)
      return
    }
    // 執行角色專屬大招
    ultimate.execute(character, this.context)
  }
  /** 默認大招邏輯（向後兼容，當角色沒有設置大招時使用） */
  private performDefaultUltimate(character: ICharacter, target: ICharacter, currentTick: number): void {
    // 發送大招事件
    this.context.eventBus.emit('entity:attack', {
      sourceId: character.id,
      targetId: target.id,
      tick: currentTick,
    })
    // 計算大招傷害（基礎攻擊力 * 倍率）
    const baseDamage = character.getAttribute('attackDamage') ?? 0
    const ultimateDamage = baseDamage * 3
    // 創建大招傷害事件
    const damageEvent = this.damageFactory.createUltimateEvent(character, target, ultimateDamage, currentTick)
    // 執行傷害計算
    this.damageChain.execute(damageEvent)
  }
  /** 累積能量 */
  private gainEnergy(character: ICharacter, amount: number): void {
    const currentEnergy = character.getAttribute('currentEnergy') ?? 0
    const maxEnergy = character.getAttribute('maxEnergy') ?? 100
    const newEnergy = Math.min(currentEnergy + amount, maxEnergy)
    character.setBaseAttribute('currentEnergy', newEnergy)
  }
  /** 能量自然回復（每 100 tick 觸發） */
  private processEnergyRegen(character: ICharacter, currentTick: number): void {
    // 每 100 tick 回復一次
    if (currentTick % 100 !== 0) return
    const energyRegen = character.getAttribute('energyRegen') ?? 0
    if (energyRegen > 0) {
      this.gainEnergy(character, energyRegen)
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
