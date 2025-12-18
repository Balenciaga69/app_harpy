import { nanoid } from 'nanoid'
import { AffixInstance } from '../../domain/affix/AffixInstance'

const generate = (templateIds: string[], difficulty: number, stageProgress: number, sourceUnitId: string) => {
  const templates: AffixInstance[] = templateIds.map((templateId) => ({
    id: `affix-instance-${nanoid()}`,
    templateId,
    sourceUnitId,
    atCreated: {
      stageProgress,
      difficulty,
    },
  }))
  return templates
}

export const AffixInstanceGenerator = {
  generator: generate,
}
