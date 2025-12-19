import { SpawnInfo } from '../models/SpawnInfo'
import { RandomHelper } from './RandomHelper'

type ValidInfo = { info: SpawnInfo; cumWeight: number }

const roll = (seed: number, spawnInfo: SpawnInfo[]) => {
  const randomHelper = new RandomHelper(seed)
  let cumWeight = 0
  const validInfos: ValidInfo[] = []

  spawnInfo.forEach((info) => {
    if (info.weight <= 0) return
    cumWeight += info.weight
    validInfos.push({ info, cumWeight })
  })

  // if (validInfos.length === 0) return null // TODO: 改成 Error

  const randomValue = randomHelper.next() * cumWeight

  for (const { info, cumWeight } of validInfos) {
    if (randomValue < cumWeight) return info.templateId
  }

  return spawnInfo[spawnInfo.length - 1].templateId
}

export const TemplateRoller = {
  roll,
}
