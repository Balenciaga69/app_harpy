import { Result } from '../result/Result'
import { RandomHelper } from './RandomHelper'
type ValidInfo<T = string> = { id: T; cumWeight: number }
export interface RollInfo<T = string> {
  id: T
  weight: number
}
const roll = <T = string>(seed: number, weightInfo: RollInfo<T>[]) => {
  let cumWeight = 0
  const validInfos: ValidInfo<T>[] = []
  for (const info of weightInfo) {
    if (info.weight <= 0) continue
    cumWeight += info.weight
    validInfos.push({ id: info.id, cumWeight })
  }
  if (validInfos.length === 0) {
    return Result.fail<T>('無可用選項可供骰選')
  }
  return Result.success<T>(getRolledId(seed, validInfos, cumWeight))
}
const getRolledId = <T = string>(seed: number, validInfos: ValidInfo<T>[], cumWeight: number): T => {
  const randomValue = new RandomHelper(seed).next() * cumWeight
  for (const { id, cumWeight } of validInfos) {
    if (randomValue < cumWeight) return id
  }
  return validInfos.at(-1).id
}
export const WeightRoller = {
  roll,
}
