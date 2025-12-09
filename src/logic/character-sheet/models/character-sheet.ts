import type { AttributeType } from '@/domain/attribute' /**
 * 角色屬性面板快照
 *
 * 代表計算後的靜態屬性數據，用於 UI 展示。
 * 不包含動態戰鬥狀態（如當前血量、Buff 等）。
 */
export interface ICharacterSheet {
  /** 所有屬性的最終值（基礎值 + 裝備 + 遺物） */
  readonly attributes: Record<AttributeType, number>
  /** 基礎屬性值（不含裝備與遺物） */
  readonly baseAttributes: Record<AttributeType, number>
  /** 裝備提供的屬性修飾器數量 */
  readonly equipmentModifierCount: number
  /** 遺物提供的屬性修飾器數量 */
  readonly relicModifierCount: number
}
