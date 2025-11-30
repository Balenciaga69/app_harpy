import { nanoid } from 'nanoid'
import { StackableEffect } from '../../models/stackableEffect.model'
import type { ICharacter } from '../../../character/interfaces/character.interface'
import type { CombatContext } from '../../../core/CombatContext'
/**
 * 毒效果
 * - 每層每 Tick 造成 1 點 DoT
 * - 無視護甲與閃避
 * - 理論上無上限
 * - 每秒減少 10% 層數或至少 1 層
 */
export class PoisonEffect extends StackableEffect {
  private readonly damagePerStack: number = 1 // 每層每 Tick 造成 1 點傷害
  private readonly decayRate: number = 0.1 // 每秒減少 10%
  private lastDecayTick: number = 0
  private damageTickCounter: number = 0
  constructor(initialStacks: number = 1) {
    // 毒沒有最大層數限制
    super(`poison-${nanoid(6)}`, '毒', undefined)
    this.setStacks(initialStacks)
  }
  onApply(_character: ICharacter, context: CombatContext): void {
    this.lastDecayTick = context.getCurrentTick()
    this.damageTickCounter = 0
  }
  onRemove(_character: ICharacter, _context: CombatContext): void {
    // 毒效果移除時不需要清理任何修飾器
  }
  onTick(character: ICharacter, context: CombatContext): void {
    const currentTick = context.getCurrentTick()
    // 每個 Tick 造成傷害
    this.applyPoisonDamage(character, context)
    // 檢查是否需要衰減
    const ticksPassed = currentTick - this.lastDecayTick
    const secondsPassed = ticksPassed / 100 // 假設 100 ticks = 1 秒
    if (secondsPassed >= 1) {
      // 每秒減少 10% 層數或至少 1 層
      const decayAmount = Math.max(1, Math.floor(this.stacks * this.decayRate))
      this.removeStacks(decayAmount)
      this.lastDecayTick = currentTick
      // 如果層數歸零，移除效果
      if (this.stacks === 0) {
        character.effects.removeEffect(this.id, context)
        return
      }
    }
  }
  /** 施加毒傷害（每 Tick） */
  private applyPoisonDamage(character: ICharacter, context: CombatContext): void {
    const damage = this.stacks * this.damagePerStack
    if (damage > 0) {
      // 直接扣除生命值（無視護甲與閃避）
      const currentHp = character.attributes.get('currentHp')
      const newHp = Math.max(0, currentHp - damage)
      character.attributes.setCurrentHp(newHp)
      // 發送傷害事件
      context.eventBus.emit('entity:damage', {
        targetId: character.id,
        amount: damage,
        sourceId: this.id,
      })
      // 檢查是否死亡
      if (newHp === 0 && !character.isDead) {
        character.isDead = true
        context.eventBus.emit('entity:death', {
          targetId: character.id,
        })
      }
    }
    this.damageTickCounter++
  }
}
