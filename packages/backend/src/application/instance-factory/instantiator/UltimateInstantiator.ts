import { nanoid } from 'nanoid'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

const instantiate = (params: {
  templateIds: string[]
  difficulty: number
  chapter: ChapterLevel
  stage: number
  sourceUnitId: string
}) => {
  const { templateIds, difficulty, chapter, stage, sourceUnitId } = params
  const instances: UltimateInstance[] = templateIds.map((templateId) => ({
    id: `ultimate-instance-${nanoid()}`,
    templateId,
    sourceUnitId,
    pluginIds: [],
    atCreated: {
      chapter,
      stage,
      difficulty,
    },
  }))
  return instances
}

export const UltimateInstantiator = {
  instantiate,
}
