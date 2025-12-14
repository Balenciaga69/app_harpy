import type { IEffectApplier, IPreCombatVariable, ICombatInjectionPayload } from '../interfaces'

/**
 * 效果應用器實作
 *
 * 將 PreCombat 變數轉換為 CombatEngine 可接受的格式
 */
export class EffectApplier implements IEffectApplier {
  /* 序列化變數為戰鬥引擎注入格式 */
  serializeForCombat(variables: IPreCombatVariable[]): ICombatInjectionPayload {
    // 驗證變數
    if (!this.validateVariables(variables)) {
      throw new Error('變數格式無效')
    }

    return {
      variables: variables.map((v) => ({
        ...v,
        // 確保所有欄位都存在
        id: v.id,
        description: v.description,
        applyLogicIdentifier: v.applyLogicIdentifier,
        durationTicks: v.durationTicks,
        impactSummary: v.impactSummary,
        parameters: v.parameters || {},
      })),
      serializedAt: Date.now(),
    }
  }

  /* 驗證變數格式 */
  validateVariables(variables: IPreCombatVariable[]): boolean {
    if (!Array.isArray(variables)) {
      return false
    }

    return variables.every((v) => {
      return (
        typeof v.id === 'string' &&
        v.id.length > 0 &&
        typeof v.description === 'string' &&
        typeof v.applyLogicIdentifier === 'string' &&
        v.applyLogicIdentifier.length > 0 &&
        typeof v.durationTicks === 'number' &&
        typeof v.impactSummary === 'string'
      )
    })
  }
}
