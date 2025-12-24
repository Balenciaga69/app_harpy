import { nanoid } from 'nanoid'
import { AffixInstance } from '../../../domain/affix/AffixInstance'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

const createMany = (params: {
  templateIds: string[]
  difficulty: number
  chapter: ChapterLevel
  stage: number
  sourceUnitId: string
}) => {
  const { templateIds, difficulty, chapter, stage, sourceUnitId } = params
  const templates: AffixInstance[] = templateIds.map((templateId) =>
    createOne({ templateId, difficulty, chapter, stage, sourceUnitId })
  )
  return templates
}
const createOne = (params: {
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

export const AffixFactory = {
  createMany,
  createOne,
}
