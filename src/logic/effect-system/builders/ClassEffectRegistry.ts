import type { IEffect } from '../models/effect'
import { ClassNotRegisteredError } from '../errors'
/**
 * 效果建構函式類型
 *
 * 接收參數並返回效果實例。
 * 參數通常來自詞綴實例的 rolledValue。
 */
export type EffectConstructor = (...args: unknown[]) => IEffect
/**
 * Class 效果註冊表
 *
 * 維護 effect_class_* 與對應 Effect Class 的映射。
 * 支援動態註冊新效果類型。
 *
 * 設計原則：
 * - 單例模式，全局共享註冊表
 * - 支援運行時註冊
 * - 提供清晰的錯誤訊息
 */
export class ClassEffectRegistry {
  private static instance: ClassEffectRegistry
  private registry: Map<string, EffectConstructor> = new Map()
  private constructor() {
    // 私有建構子，強制使用 getInstance
  }
  /**
   * 取得單例實例
   */
  static getInstance(): ClassEffectRegistry {
    if (!ClassEffectRegistry.instance) {
      ClassEffectRegistry.instance = new ClassEffectRegistry()
    }
    return ClassEffectRegistry.instance
  }
  /**
   * 註冊 Class 效果
   *
   * @param classId 效果 Class ID (e.g., 'effect_class_blood_pact')
   * @param constructor 效果建構函式
   */
  register(classId: string, constructor: EffectConstructor): void {
    this.registry.set(classId, constructor)
  }
  /**
   * 取得 Class 效果建構函式
   *
   * @param classId 效果 Class ID
   * @returns 效果建構函式
   * @throws ClassNotRegisteredError 當 Class 未註冊時
   */
  getConstructor(classId: string): EffectConstructor {
    const constructor = this.registry.get(classId)
    if (!constructor) {
      throw new ClassNotRegisteredError(classId)
    }
    return constructor
  }
  /**
   * 檢查 Class 是否已註冊
   */
  hasClass(classId: string): boolean {
    return this.registry.has(classId)
  }
  /**
   * 取得所有已註冊的 Class ID
   */
  getAllClassIds(): string[] {
    return Array.from(this.registry.keys())
  }
  /**
   * 清空註冊表（測試用）
   */
  clear(): void {
    this.registry.clear()
  }
}
