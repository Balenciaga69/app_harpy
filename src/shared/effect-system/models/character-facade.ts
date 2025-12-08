import type { AttributeType } from '@/domain/attribute'
import type { AttributeModifier } from '@/shared/attribute-system'

/**
 * 角色屬性操作最小介面
 *
 * 定義 Effect 需要的角色操作能力。
 * 此介面不依賴任何戰鬥專屬邏輯，可在戰鬥內外使用。
 */
export interface ICharacterFacade {
  readonly id: string

  /**
   * 取得屬性值（已計算修飾器）
   */
  getAttribute(type: AttributeType): number

  /**
   * 添加屬性修飾器
   */
  addAttributeModifier(modifier: AttributeModifier): void

  /**
   * 移除屬性修飾器
   */
  removeAttributeModifier(modifierId: string): void
}
