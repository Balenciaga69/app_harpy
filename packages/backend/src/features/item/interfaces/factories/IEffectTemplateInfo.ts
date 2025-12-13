import type { IAffixInstance } from '../definitions/IAffixInstance'

/**
 * 效果模板資訊
 *
 * 包含效果模板 ID 與對應的詞綴實例
 * 用於在不同模組間傳遞效果建構所需的資訊
 */
export interface IEffectTemplateInfo {
  /** 效果模板 ID */
  readonly templateId: string
  /** 產生此效果的詞綴實例 */
  readonly affixInstance: IAffixInstance
}
