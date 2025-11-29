import { nanoid } from 'nanoid'
import { StackableEffect } from '../../models/stackableEffect.model'
import type { ICharacter } from '../../../character/models/character.model'
import type { CombatContext } from '../../../core/CombatContext'
/**
 * 冰緩效果
 * - 延長敵方攻擊/施法冷卻時間
 * - 預設 4%/層
 * - 最高 16 層
 * - 隨時間衰減
 */
export class ChillEffect extends StackableEffect {
  private readonly cooldownIncreasePerStack: number = 0.04 // 4%
  private attackModifierId: string | null = null
  private spellModifierId: string | null = null
  private readonly decayRate: number = 0.1 // 每秒減少 10%
  private lastDecayTick: number = 0
  constructor(initialStacks: number = 1) {
    super(`chill-${nanoid(6)}`, '冰緩', 16)
    this.setStacks(initialStacks)
  }
  onApply(character: ICharacter, context: CombatContext): void {
    this.lastDecayTick = context.getCurrentTick()
    this.updateCooldownModifiers(character)
  }
  onRemove(character: ICharacter, _context: CombatContext): void {
    if (this.attackModifierId) {
      character.attributes.removeModifier(this.attackModifierId)
      this.attackModifierId = null
    }
    if (this.spellModifierId) {
      character.attributes.removeModifier(this.spellModifierId)
      this.spellModifierId = null
    }
  }
  onTick(character: ICharacter, context: CombatContext): void {
    const currentTick = context.getCurrentTick()
    const ticksPassed = currentTick - this.lastDecayTick
    // 假設 100 ticks = 1 秒
    const secondsPassed = ticksPassed / 100
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
      this.updateCooldownModifiers(character)
    }
  }
  /** 更新冷卻時間修飾器（增加冷卻時間） */
  private updateCooldownModifiers(character: ICharacter): void {
    // 移除舊的修飾器
    if (this.attackModifierId) {
      character.attributes.removeModifier(this.attackModifierId)
    }
    if (this.spellModifierId) {
      character.attributes.removeModifier(this.spellModifierId)
    }
    // 計算冷卻時間增加百分比（使用乘法修飾器）
    const cooldownIncrease = this.stacks * this.cooldownIncreasePerStack
    // 添加攻擊冷卻修飾器
    this.attackModifierId = `${this.id}-attack-cd`
    character.attributes.addModifier({
      id: this.attackModifierId,
      type: 'attackCooldown',
      value: cooldownIncrease,
      mode: 'multiply',
      source: this.id,
    })
    // 添加施法冷卻修飾器
    this.spellModifierId = `${this.id}-spell-cd`
    character.attributes.addModifier({
      id: this.spellModifierId,
      type: 'spellCooldown',
      value: cooldownIncrease,
      mode: 'multiply',
      source: this.id,
    })
  }
}
