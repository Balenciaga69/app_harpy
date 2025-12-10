/**
 * EffectBuilder 錯誤類別
 *
 * 處理效果建構過程中的各種錯誤情況。
 */
export class EffectBuilderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EffectBuilderError'
  }
}
/**
 * 未知效果模板錯誤
 *
 * 當 effectTemplateId 格式無法識別時拋出。
 */
export class UnknownEffectTemplateError extends EffectBuilderError {
  constructor(templateId: string) {
    super(`Unknown effect template: ${templateId}. Must start with 'effect_static_' or 'effect_class_'.`)
    this.name = 'UnknownEffectTemplateError'
  }
}
/**
 * 無效靜態效果錯誤
 *
 * 當靜態效果格式錯誤或無法解析時拋出。
 */
export class InvalidStaticEffectError extends EffectBuilderError {
  constructor(templateId: string, reason: string) {
    super(`Invalid static effect '${templateId}': ${reason}`)
    this.name = 'InvalidStaticEffectError'
  }
}
/**
 * Class 效果未註冊錯誤
 *
 * 當 Class 效果未在註冊表中時拋出。
 */
export class ClassNotRegisteredError extends EffectBuilderError {
  constructor(classId: string) {
    super(`Effect class '${classId}' is not registered. Register it using ClassEffectRegistry.register().`)
    this.name = 'ClassNotRegisteredError'
  }
}
