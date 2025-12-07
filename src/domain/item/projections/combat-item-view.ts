import type { IAffixInstance } from '../affixes'
/**
 * ICombatItemView
 *
 * Combat Engine 需要的物品視角投影。
 * 只包含戰鬥計算所需的欄位，隔離 UI 與 Inventory 的關注點。
 */
export interface ICombatItemView {
  /** 物品唯一識別碼 */
  readonly id: string
  /** 對應的效果模板 ID 列表 */
  readonly effectTemplateIds: readonly string[]
  /** 已生成的詞綴實例列表 */
  readonly affixInstances: readonly IAffixInstance[]
}
