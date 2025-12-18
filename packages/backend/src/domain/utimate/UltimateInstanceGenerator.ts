import { nanoid } from 'nanoid'
import { UltimateInstance } from './models/UltimateInstance'

const generate = (templateIds: string[], difficulty: number, stageProgress: number, sourceUnitId: string) => {
  const instances: UltimateInstance[] = templateIds.map((templateId) => ({
    id: `ultimate-instance-${nanoid()}`,
    templateId,
    sourceUnitId,
    atAcquisition: {
      stageProgress,
      difficulty,
    },
  }))
  return instances
}

export const UltimateInstanceGenerator = {
  generator: generate,
}
