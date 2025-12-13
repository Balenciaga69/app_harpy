/**
 * AffixGenerator
 *
 * 負責生成詞綴實例的類別。
 * 使用策略模式應用過濾邏輯。
 */
// TODO: 依賴外部模組 item，未來需抽象化
import type { IAffixDefinition } from '@/features/item/interfaces/definitions/IAffixDefinition'
import { AffixRoller } from '../../domain/AffixRoller'
import type { IAffixFilter } from '../../interfaces/strategies/IAffixFilter'
/**
 * AffixGenerator 配置
 */
export interface IAffixGeneratorConfig {
  /** 詞綴過濾策略 */
  filter?: IAffixFilter
}
/**
 * AffixGenerator 核心類別
 */
export class AffixGenerator {
  // private readonly filter: IAffixFilter
  constructor(_config: IAffixGeneratorConfig) {
    // this.filter = config.filter!
  }
  /**
   * 生成詞綴實例
   */
  generateAffixes(
    availableAffixes: IAffixDefinition[],
    count: number,
    rng: { next: () => number }
  ): Array<{ affixId: string; value: number }> {
    if (availableAffixes.length === 0) return []
    const result: Array<{ affixId: string; value: number }> = []
    const used = new Set<string>()
    // 使用 AffixRoller 擲骰
    const roller = new AffixRoller(rng, availableAffixes)
    for (let i = 0; i < count; i++) {
      // 過濾已使用的詞綴
      const candidates = availableAffixes.filter((affix) => !used.has(affix.id))
      if (candidates.length === 0) break
      // 使用 roll 方法生成詞綴實例
      const instances = roller.roll(
        candidates.map((c) => c.id),
        1
      )
      if (instances.length === 0) break
      const instance = instances[0]
      // IAffixInstance 使用的欄位為 definitionId / rolledValue
      result.push({ affixId: instance.definitionId, value: instance.rolledValue })
      used.add(instance.definitionId)
    }
    return result
  }
}
