import { AffixRecord } from '../../../domain/affix/Affix'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id'
/** AffixRecord 創建參數 */
export interface AffixRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}
function createRecord(templateId: string, params: AffixRecordCreateParams): AffixRecord {
  return {
    id: IdGeneratorHelper.generateAffixRecordId(),
    templateId,
    sourceUnitId: params.sourceUnitId,
    atCreated: params.atCreated,
  }
}
function createManyRecords(templateIds: string[], params: AffixRecordCreateParams): AffixRecord[] {
  return templateIds.map((templateId) => createRecord(templateId, params))
}
/**
 * AffixRecordFactory：負責AffixRecord的創建
 * - 單一職責：生成帶有唯一 ID 與創建背景的AffixRecord
 * - 無副作用：純粹的資料構建
 */
export const AffixRecordFactory = {
  createOne: createRecord,
  createMany: createManyRecords,
}
