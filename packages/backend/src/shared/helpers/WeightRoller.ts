import { RandomHelper } from './RandomHelper'

type ValidInfo = { id: string; cumWeight: number }

export interface RollInfo {
  id: string
  weight: number
}

const roll = (seed: number, weightInfo: RollInfo[]) => {
  let cumWeight = 0
  const validInfos: ValidInfo[] = []
  weightInfo.forEach((info) => {
    if (info.weight <= 0) return
    cumWeight += info.weight
    validInfos.push({ id: info.id, cumWeight })
  })
  // if (validInfos.length === 0) return null // TODO: 改成 Error
  return getRolledId(seed, validInfos, cumWeight)
}

const getRolledId = (seed: number, validInfos: ValidInfo[], cumWeight: number) => {
  const randomValue = new RandomHelper(seed).next() * cumWeight

  for (const { id, cumWeight } of validInfos) {
    if (randomValue < cumWeight) return id
  }

  return validInfos[validInfos.length - 1].id
}

export const WeightRoller = {
  roll,
}
