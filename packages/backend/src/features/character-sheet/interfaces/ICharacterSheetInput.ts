import { IBaseAttributeValues } from '@/features/attribute'
import { IEquipmentInstance, IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'
export interface ICharacterSheetInput {
  /** 角色的基礎屬性值 */
  readonly baseAttributes: IBaseAttributeValues
  /** 已裝備的裝備實例列表 */
  readonly equipments: readonly IEquipmentInstance[]
  /** 已擁有的遺物實例列表 */
  readonly relics: readonly IRelicInstance[]
}
