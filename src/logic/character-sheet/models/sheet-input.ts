import type { BaseAttributeValues } from '@/domain/attribute'
import type { IEquipmentInstance, IRelicInstance } from '@/domain/item' /**
 * 角色屬性面板計算器的輸入
 *
 * 包含計算最終屬性所需的所有靜態數據。
 */
export interface ICharacterSheetInput {
  /** 角色的基礎屬性值 */
  readonly baseAttributes: BaseAttributeValues
  /** 已裝備的裝備實例列表 */
  readonly equipments: readonly IEquipmentInstance[]
  /** 已擁有的遺物實例列表 */
  readonly relics: readonly IRelicInstance[]
}
