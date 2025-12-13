// TODO: 依賴外部模組 item，未來需抽象化
import type { IAffixDefinition } from '@/features/item/interfaces/definitions/IAffixDefinition'
// TODO: 依賴外部模組 item，未來需抽象化
import type { IAffixInstance } from '@/features/item/interfaces/definitions/IAffixInstance'
/** 隨機數產生器介面，跨語言友好 */
export interface IRng {
  /** 產生 0~1 之間的隨機數 */
  next(): number
}
/**
 * AffixRoller
 *
 * 詞綴生成器，根據詞綴定義池與 RNG 生成詞綴實例。
 * 純運算類別，不依賴任何框架。
 */
export class AffixRoller {
  private readonly rng: IRng
  private readonly definitions: Map<string, IAffixDefinition>
  constructor(rng: IRng, definitions: IAffixDefinition[]) {
    this.rng = rng
    this.definitions = new Map(definitions.map((d) => [d.id, d]))
  }
  /** 從指定的詞綴池中隨機選取並生成詞綴實例 */
  roll(affixPoolIds: readonly string[], count: number): IAffixInstance[] {
    const pool = this.buildWeightedPool(affixPoolIds)
    if (pool.length === 0) return []
    const selected = this.selectFromPool(pool, count)
    return selected.map((def) => this.createInstance(def))
  }
  /** 根據單一詞綴定義生成實例 */
  rollSingle(definitionId: string): IAffixInstance | null {
    const def = this.definitions.get(definitionId)
    if (!def) return null
    return this.createInstance(def)
  }
  /** 根據 affixPoolIds 建立加權詞綴池。 */
  private buildWeightedPool(affixPoolIds: readonly string[]): IAffixDefinition[] {
    return affixPoolIds
      .map((id) => this.definitions.get(id))
      .filter((def): def is IAffixDefinition => def !== undefined)
  }
  /** 從 affix pool 中依權重隨機選取指定數量的 affix。 */
  private selectFromPool(pool: IAffixDefinition[], count: number): IAffixDefinition[] {
    const selected: IAffixDefinition[] = []
    const remaining = [...pool]
    for (let i = 0; i < count && remaining.length > 0; i++) {
      const pick = this.weightedPick(remaining)
      if (pick) {
        selected.push(pick)
        const idx = remaining.indexOf(pick)
        if (idx !== -1) remaining.splice(idx, 1)
      }
    }
    return selected
  }
  /** 根據權重隨機選取一個 AffixDefinition。 */
  private weightedPick(pool: IAffixDefinition[]): IAffixDefinition | null {
    const currentTotal = pool.reduce((sum, def) => sum + def.weight, 0)
    if (currentTotal <= 0) return null
    let roll = this.rng.next() * currentTotal
    for (const def of pool) {
      roll -= def.weight
      if (roll <= 0) return def
    }
    return pool[pool.length - 1]
  }
  /** 根據詞綴定義隨機生成一個詞綴實例 */
  private createInstance(def: IAffixDefinition): IAffixInstance {
    const range = def.maxValue - def.minValue
    const rolledValue = range === 0 ? def.minValue : def.minValue + this.rng.next() * range
    return {
      definitionId: def.id,
      rolledValue: Math.round(rolledValue * 100) / 100,
    }
  }
}
