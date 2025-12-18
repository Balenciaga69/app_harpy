import { nanoid } from 'nanoid'
import { AffixInstance } from './models/AffixInstance'

const generate = (templateIds: string[], difficulty: number, stageProgress: number, sourceUnitId: string) => {
  const templates: AffixInstance[] = templateIds.map((templateId) => ({
    id: `affix-instance-${nanoid()}`,
    templateId,
    sourceUnitId,
    atAcquisition: {
      stageProgress,
      difficulty,
    },
  }))
  return templates
}

export const AffixInstanceGenerator = {
  generator: generate,
}
