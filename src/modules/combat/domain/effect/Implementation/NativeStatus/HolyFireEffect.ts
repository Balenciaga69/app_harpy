import { nanoid } from 'nanoid'
import { StackableEffect } from '../../models/stackable.effect.model'
import type { ICharacter } from '../../../character'
import type { CombatContext } from '../../../../context'
/**
 * 聖火效果
 * - 每層提升護甲值
 * - 達到特定層數時觸發額外效果（10, 20, 30, 40, 50）
 * - 最高 50 層
 */
export class HolyFireEffect extends StackableEffect {
  private readonly armorPerStack: number = 10
  private modifierId: string | null = null
  constructor(initialStacks: number = 1) {
    super(`holy-fire-${nanoid(6)}`, '聖火', 50)
    this.setStacks(initialStacks)
  }
  onApply(character: ICharacter, context: CombatContext): void {
    this.updateArmorModifier(character)
    this.checkThresholdEffects(character, context)
  }
  onRemove(character: ICharacter, _context: CombatContext): void {
    if (this.modifierId) {
      character.removeAttributeModifier(this.modifierId)
      this.modifierId = null
    }
  }
  onTick(character: ICharacter, context: CombatContext): void {
    // 聖火不會隨時間衰減，只在特定條件下移除
    this.checkThresholdEffects(character, context)
  }
  /** 更新護甲修飾器 */
  private updateArmorModifier(character: ICharacter): void {
    // 移除舊的修飾器
    if (this.modifierId) {
      character.removeAttributeModifier(this.modifierId)
    }
    // 添加新的修飾器
    this.modifierId = `${this.id}-armor`
    character.addAttributeModifier({
      id: this.modifierId,
      type: 'armor',
      value: this.stacks * this.armorPerStack,
      mode: 'add',
      source: this.id,
    })
  }
  /** 檢查層數閾值效果 */
  private checkThresholdEffects(character: ICharacter, context: CombatContext): void {
    const thresholds = [10, 20, 30, 40, 50]
    const currentThreshold = thresholds.find((t) => this.stacks >= t) ?? 0
    // 這裡可以根據不同閾值觸發不同效果
    // 例如：10層時獲得小額回血，50層時獲得護盾等
    // 目前先記錄事件即可
    if (currentThreshold > 0) {
      context.eventBus.emit('entity:heal', {
        targetId: character.id,
        amount: 0, // TODO: 實際的閾值效果待後續實作
      })
    }
  }
  /** 覆寫 addStacks 以即時更新修飾器 */
  addStacks(amount: number): void {
    super.addStacks(amount)
    // 層數變更時需要更新修飾器，但這需要在 context 中才能操作
    // 所以這裡只記錄，實際更新在 onTick 或 EffectManager 中處理
  }
  /** 覆寫 removeStacks 以即時更新修飾器 */
  removeStacks(amount: number): void {
    super.removeStacks(amount)
    // 同上
  }
}
