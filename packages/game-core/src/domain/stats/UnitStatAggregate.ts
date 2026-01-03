import { UnitStatModifier } from './models/StatModifier'
import { UnitStats } from './models/UnitStats'
/** 統計修飾符按字段分組的臨時映射 */
type ByField = Partial<Record<keyof UnitStats, UnitStatModifier[]>>
/**
 * 計算單一統計值，應用 ADD → MULTIPLY → SET 的優先級順序
 * 依據優先級應用修飾符：先累加所有 ADD 操作，再累乘 MULTIPLY 操作，最後檢查是否有 SET 操作覆蓋
 */
function computeAggregatedValue(base: number, mods: readonly UnitStatModifier[]): number {
  let addSum = 0
  let multiplySum = 0
  let lastSet: number | undefined = undefined
  for (const m of mods) {
    switch (m.operation) {
      case 'ADD':
        addSum += m.value
        break
      case 'MULTIPLY':
        multiplySum += m.value
        break
      case 'SET':
        lastSet = m.value
        break
      default:
        break
    }
  }
  let v = (base + addSum) * (1 + multiplySum)
  if (lastSet !== undefined) v = lastSet
  return v
}
/**
 * 彙總所有統計修飾符，為每個統計字段計算最終值
 * 步驟：1. 按字段分組修飾符；2. 對每個字段應用優先級計算；3. 返回最終統計值映射
 */
export const UnitStatAggregate = (baseStats: UnitStats, modifiers: readonly UnitStatModifier[]): UnitStats => {
  const byField: ByField = {}
  for (const m of modifiers) {
    const f = m.field as keyof UnitStats
    if (!byField[f]) byField[f] = []
    byField[f]!.push(m)
  }
  const result: UnitStats = { ...baseStats }
  const fieldsWithMods = Object.keys(byField) as (keyof UnitStats)[]
  for (const field of fieldsWithMods) {
    const mods = byField[field] ?? []
    const baseVal = Number(baseStats[field] ?? 0)
    const aggregated = computeAggregatedValue(baseVal, mods)
    result[field] = aggregated
  }
  return result
}
