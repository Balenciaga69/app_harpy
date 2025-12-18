import { nanoid } from 'nanoid'
import { UltimateInstance } from '../../domain/ultimate/UltimateInstance'

const generate = (templateIds: string[], difficulty: number, stageProgress: number, sourceUnitId: string) => {
  const instances: UltimateInstance[] = templateIds.map((templateId) => ({
    id: `ultimate-instance-${nanoid()}`,
    templateId,
    sourceUnitId,
    pluginIds: [],
    atCreated: {
      stageProgress,
      difficulty,
    },
  }))
  return instances
}

export const UltimateInstanceGenerator = {
  generator: generate,
}
