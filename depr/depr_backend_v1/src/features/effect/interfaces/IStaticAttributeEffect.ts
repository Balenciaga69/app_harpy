import type { AttributeType } from '@/features/attribute/interfaces/AttributeType'
import type { IEffect } from './IEffect'
import type { IEffectServices } from './IEffectServices'
import type { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import { nanoid } from 'nanoid'
/**
 * 靜態屬性效果
 *
 * 輕量級效果實作，僅提供屬性加成，不註冊任何鉤子。
 * 用於 effect_static_* 類型的效果模板。
 */
export class StaticAttributeEffect implements IEffect {
  readonly id: string
  readonly name: string
  readonly cleanseOnRevive: boolean = false
  private attributeType: AttributeType
  private value: number
  private modifierId: string
  constructor(attributeType: AttributeType, value: number, displayName: string) {
    this.id = `static-${attributeType}-${nanoid(6)}`
    this.modifierId = `modifier-${this.id}`
    this.name = displayName
    this.attributeType = attributeType
    this.value = value
  }
  onApply(characterId: string, services: IEffectServices): void {
    const character = services.getCharacter(characterId)
    const modifier: AttributeModifier = {
      id: this.modifierId,
      type: this.attributeType,
      value: this.value,
      mode: 'add',
      source: this.name,
    }
    character.addAttributeModifier(modifier)
  }
  onRemove(characterId: string, services: IEffectServices): void {
    const character = services.getCharacter(characterId)
    character.removeAttributeModifier(this.modifierId)
  }
  /** 取得屬性類型 */
  getAttributeType(): AttributeType {
    return this.attributeType
  }
  /** 取得數值 */
  getValue(): number {
    return this.value
  }
}
