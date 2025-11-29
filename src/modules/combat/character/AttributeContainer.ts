// 尚未實作
import type { AttributeType, BaseAttributeValues, AttributeModifier } from './models/attribute.model'
export class AttributeContainer {
  private baseValues: Map<AttributeType, number>
  private modifiers: Map<AttributeType, AttributeModifier[]>
  private cachedValues: Map<AttributeType, number>
  constructor(baseAttributes: BaseAttributeValues) {
    this.baseValues = new Map()
    this.modifiers = new Map()
    this.cachedValues = new Map()
    // 初始化基礎屬性
    Object.entries(baseAttributes).forEach(([key, value]) => {
      this.baseValues.set(key as AttributeType, value)
    })
  }
  /** 獲取最終計算後的屬性值 */
  get(type: AttributeType): number {
    // 若緩存失效則重新計算
    if (!this.cachedValues.has(type)) {
      this.cachedValues.set(type, this.calculate(type))
    }
    return this.cachedValues.get(type)!
  }
  /** 添加屬性修飾器 (由 Effect 調用) */
  addModifier(modifier: AttributeModifier): void {
    if (!this.modifiers.has(modifier.type)) {
      this.modifiers.set(modifier.type, [])
    }
    this.modifiers.get(modifier.type)!.push(modifier)
    this.invalidateCache(modifier.type)
  }
  /** 移除屬性修飾器 (由 Effect 調用) */
  removeModifier(modifierId: string): void {
    this.modifiers.forEach((list, type) => {
      const index = list.findIndex((m) => m.id === modifierId)
      if (index !== -1) {
        list.splice(index, 1)
        this.invalidateCache(type)
      }
    })
  }
  /** 計算最終屬性值 (基礎值 + 修飾器) */
  private calculate(type: AttributeType): number {
    const base = this.baseValues.get(type) ?? 0
    const mods = this.modifiers.get(type) ?? []
    // 先計算加法修飾器
    const additive = mods.filter((m) => m.mode === 'add').reduce((sum, m) => sum + m.value, 0)
    // 再計算乘法修飾器
    const multiplier = mods.filter((m) => m.mode === 'multiply').reduce((product, m) => product * (1 + m.value), 1)
    return (base + additive) * multiplier
  }
  /** 清除緩存 */
  private invalidateCache(type: AttributeType): void {
    this.cachedValues.delete(type)
  }
  /** 直接設置當前 HP (受傷/治療時使用) */
  setCurrentHp(value: number): void {
    const maxHp = this.get('maxHp')
    this.baseValues.set('currentHp', Math.max(0, Math.min(value, maxHp)))
    this.invalidateCache('currentHp')
  }
}
