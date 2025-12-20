import { TemplateWeightInfo } from '../models/TemplateWeightInfo'
import { RandomHelper } from './RandomHelper'

type ValidInfo = { info: TemplateWeightInfo; cumWeight: number }

const roll = (seed: number, weightInfo: TemplateWeightInfo[]) => {
  const randomHelper = new RandomHelper(seed)
  let cumWeight = 0
  const validInfos: ValidInfo[] = []

  weightInfo.forEach((info) => {
    if (info.weight <= 0) return
    cumWeight += info.weight
    validInfos.push({ info, cumWeight })
  })

  // if (validInfos.length === 0) return null // TODO: 改成 Error

  const randomValue = randomHelper.next() * cumWeight

  for (const { info, cumWeight } of validInfos) {
    if (randomValue < cumWeight) return info.templateId
  }

  return weightInfo[weightInfo.length - 1].templateId
}

export const TemplateRoller = {
  roll,
}
