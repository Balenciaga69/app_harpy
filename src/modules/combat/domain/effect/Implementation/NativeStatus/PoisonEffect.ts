import { nanoid } from 'nanoid'
import { StackableEffect } from '../../models/stackable.effect.model'
import type { ICharacter } from '../../../character'
import type { CombatContext } from '../../../../context'
/**
 * 毒效果
 * - 每層每 Tick 造成固定傷害
 * - 真實傷害（無視護甲與閃避）
 * - 理論上無上限
 * - 每秒減少 10% 層數或至少 1 層
 */
export class PoisonEffect extends StackableEffect {
  private readonly damagePerStack: number = 1
  private readonly decayRate: number = 0.1
  private lastDecayTick: number = 0
  constructor(initialStacks: number = 1) {
    super(`poison-${nanoid(6)}`, '毒', undefined)
    this.setStacks(initialStacks)
  }
  onApply(_character: ICharacter, context: CombatContext): void {
    this.lastDecayTick = context.getCurrentTick()
  }
  onRemove(_character: ICharacter, _context: CombatContext): void {
    // 無需清理
  }
  onTick(character: ICharacter, context: CombatContext): void {
    const currentTick = context.getCurrentTick()
    // 每個 Tick 造成真實傷害
    this.applyPoisonDamage(character, context)
    // 檢查衰減
    const ticksPassed = currentTick - this.lastDecayTick
    const secondsPassed = ticksPassed / 100 // 假設 100 ticks = 1 秒
    if (secondsPassed >= 1) {
      const decayAmount = Math.max(1, Math.floor(this.stacks * this.decayRate))
      this.removeStacks(decayAmount)
      this.lastDecayTick = currentTick
      if (this.stacks === 0) {
        character.removeEffect(this.id, context)
      }
    }
  }
  /** 施加毒傷害 */
  private applyPoisonDamage(character: ICharacter, context: CombatContext): void {
    const damage = this.stacks * this.damagePerStack
    if (damage > 0) {
      // 直接扣除生命值（真實傷害）
      const currentHp = character.getAttribute('currentHp')
      const newHp = Math.max(0, currentHp - damage)
      character.setCurrentHpClamped(newHp)
      // 發送傷害事件
      context.eventBus.emit('entity:damage', {
        targetId: character.id,
        amount: damage,
        sourceId: this.id,
      })
      // 檢查死亡
      if (newHp === 0 && !character.isDead) {
        character.isDead = true
        context.eventBus.emit('entity:death', {
          targetId: character.id,
        })
      }
    }
  }
}
