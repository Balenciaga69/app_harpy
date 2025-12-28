import { RandomHelper } from './RandomHelper'
type ValidInfo<T = string> = { id: T; cumWeight: number }
export interface RollInfo<T = string> {
  id: T
  weight: number
}
const roll = <T = string>(seed: number, weightInfo: RollInfo<T>[]) => {
  let cumWeight = 0
  const validInfos: ValidInfo<T>[] = []
  weightInfo.forEach((info) => {
    if (info.weight <= 0) return
    cumWeight += info.weight
    validInfos.push({ id: info.id, cumWeight })
  })
  if (validInfos.length === 0) {
    throw new Error('WeightRoller: no valid weight entries')
  }
  return getRolledId(seed, validInfos, cumWeight)
}
const getRolledId = <T = string>(seed: number, validInfos: ValidInfo<T>[], cumWeight: number): T => {
  const randomValue = new RandomHelper(seed).next() * cumWeight
  for (const { id, cumWeight } of validInfos) {
    if (randomValue < cumWeight) return id
  }
  return validInfos[validInfos.length - 1].id
}
export const WeightRoller = {
  roll,
}
