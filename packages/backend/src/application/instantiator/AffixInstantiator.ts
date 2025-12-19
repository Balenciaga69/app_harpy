import { nanoid } from 'nanoid'
import { AffixInstance } from '../../domain/affix/AffixInstance'
import { ChapterLevel } from '../../shared/models/SpawnInfo'

const instantiateMany = (params: {
  templateIds: string[]
  difficulty: number
  chapter: ChapterLevel
  stage: number
  sourceUnitId: string
}) => {
  const { templateIds, difficulty, chapter, stage, sourceUnitId } = params
  const templates: AffixInstance[] = templateIds.map((templateId) =>
    instantiateOne({ templateId, difficulty, chapter, stage, sourceUnitId })
  )
  return templates
}
const instantiateOne = (params: {
  templateId: string
  difficulty: number
  chapter: ChapterLevel
  stage: number
  sourceUnitId: string
}) => {
  const { templateId, difficulty, chapter, stage, sourceUnitId } = params
  return {
    id: `affix-instance-${nanoid()}`,
    templateId,
    sourceUnitId,
    atCreated: {
      chapter,
      stage,
      difficulty,
    },
  }
}

export const AffixInstantiator = {
  instantiateMany,
  instantiateOne,
}
