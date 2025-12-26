import { nanoid } from 'nanoid'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
/** 大絕招工廠：將大絕招樣板轉換為實例，記錄創建背景（章節、難度、來源單位） */
const create = (params: {
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
export const UltimateFactory = {
  /** 批量創建大絕招實例 */
  create,
}
