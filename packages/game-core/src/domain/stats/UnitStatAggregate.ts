import { UnitStatModifier } from './models/StatModifier'
import { UnitStats } from './models/UnitStats'
type ByField = Partial<Record<keyof UnitStats, UnitStatModifier[]>>
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
