// TODO: 依賴外部模組 item
import type { IEffectTemplateInfo } from '../../../item/app/factories/EffectFactory'
import type { IEffect } from '../../interfaces/IEffect'
import { StaticEffectGenerator } from './StaticEffectGenerator'
import { ClassEffectRegistry } from './ClassEffectRegistry'
import { UnknownEffectTemplateError } from '../../domain/errors/EffectBuilderError'
/**
 * EffectBuilder
 *
 * 負責從效果模板資訊建構具體的效果實例。
 * 是 Domain 層（資料）與 Logic 層（行為）之間的橋樑。
 *
 * 設計原則：
 * - 關注點分離：Domain 層提供資料，Logic 層建構行為
 * - 效能優化：靜態效果避免不必要的鉤子註冊
 * - 擴充性：支援動態註冊新效果類型
 * - 單一職責：僅負責效果建構，不處理效果管理
 *
 * 使用流程：
 * 1. 從物品的詞綴實例取得 IEffectTemplateInfo[]
 * 2. 使用 EffectBuilder 將模板資訊轉換為 IEffect[]
 * 3. 將效果實例注入到 Character 的 EffectManager
 */
export class EffectBuilder {
  private static readonly STATIC_PREFIX = 'effect_static_'
  private static readonly CLASS_PREFIX = 'effect_class_'
  private classRegistry: ClassEffectRegistry
  constructor(classRegistry?: ClassEffectRegistry) {
    // 允許注入自訂註冊表(測試用),否則使用全局單例
    this.classRegistry = classRegistry ?? ClassEffectRegistry.getInstance()
  }
  /**
   * 批次建構效果實例
   *
   * @param templateInfos 效果模板資訊陣列
   * @returns 效果實例陣列
   */
  buildEffects(templateInfos: IEffectTemplateInfo[]): IEffect[] {
    const effects: IEffect[] = []
    for (const templateInfo of templateInfos) {
      const effect = this.buildEffect(templateInfo)
      effects.push(effect)
    }
    return effects
  }
  /**
   * 建構單個效果實例
   *
   * @param templateInfo 效果模板資訊
   * @returns 效果實例
   * @throws UnknownEffectTemplateError 當模板 ID 格式無法識別時
   */
  buildEffect(templateInfo: IEffectTemplateInfo): IEffect {
    const { templateId } = templateInfo
    // 檢查是否為靜態效果
    if (this.isStaticEffect(templateId)) {
      return this.buildStaticEffect(templateInfo)
    }
    // 檢查是否為 Class 效果
    if (this.isClassEffect(templateId)) {
      return this.buildClassEffect(templateInfo)
    }
    // 無法識別的效果類型
    throw new UnknownEffectTemplateError(templateId)
  }
  /**
   * 建構靜態效果
   *
   * 靜態效果僅提供屬性加成，使用輕量級實作。
   *
   * @param templateInfo 效果模板資訊
   * @returns 靜態效果實例
   */
  private buildStaticEffect(templateInfo: IEffectTemplateInfo): IEffect {
    const { templateId, affixInstance } = templateInfo
    return StaticEffectGenerator.generate(templateId, affixInstance.rolledValue)
  }
  /**
   * 建構 Class 效果
   *
   * Class 效果需要自訂行為，使用註冊表查找建構函式。
   * 目前簡化實作：僅傳遞 rolledValue 作為參數。
   * 未來可擴展為支援多參數或配置物件。
   *
   * @param templateInfo 效果模板資訊
   * @returns Class 效果實例
   */
  private buildClassEffect(templateInfo: IEffectTemplateInfo): IEffect {
    const { templateId, affixInstance } = templateInfo
    const constructor = this.classRegistry.getConstructor(templateId)
    // 目前僅傳遞 rolledValue 作為參數
    // 未來可根據需求擴展參數傳遞邏輯
    return constructor(affixInstance.rolledValue)
  }
  /**
   * 檢查是否為靜態效果
   */
  private isStaticEffect(templateId: string): boolean {
    return templateId.startsWith(EffectBuilder.STATIC_PREFIX)
  }
  /**
   * 檢查是否為 Class 效果
   */
  private isClassEffect(templateId: string): boolean {
    return templateId.startsWith(EffectBuilder.CLASS_PREFIX)
  }
}
