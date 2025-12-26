import { nanoid } from 'nanoid'
import { AffixInstance } from '../../../domain/affix/AffixInstance'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

/** 將詞綴樣板轉換為詞綴實例，記錄創建上下文（章節、難度等） */
type CreateManyParams = {
  templateIds: string[]
  difficulty: number
  chapter: ChapterLevel
  stage: number
  sourceUnitId: string
}
type CreateOneParams = {
  templateId: string
  difficulty: number
  chapter: ChapterLevel
  stage: number
  sourceUnitId: string
}
/** 批量創建詞綴實例 */
const createMany = (params: CreateManyParams) => {
  const { templateIds, difficulty, chapter, stage, sourceUnitId } = params
  const templates: AffixInstance[] = templateIds.map((templateId) =>
    createOne({ templateId, difficulty, chapter, stage, sourceUnitId })
  )
  return templates
}

/** 根據樣板 ID 創建單一詞綴實例 */
const createOne = (params: CreateOneParams) => {
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
/** 詞綴工廠：負責將詞綴樣板實例化，記錄創建背景（章節、難度、來源單位） */
export const AffixFactory = {
  createMany,
  createOne,
}
