import { nanoid } from 'nanoid'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { RelicRecord } from '../../../domain/item/Item'
import { AffixRecord } from '../../../domain/affix/Affix'
/** RelicRecord 創建參數 */
export interface RelicRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
  currentStacks: number
  affixRecords: ReadonlyArray<AffixRecord>
}
/**
 * RelicRecordFactory：負責 RelicRecord 的創建
 * - 單一職責：生成帶有唯一 ID 與創建背景的 RelicRecord
 * - 無副作用：純粹的資料構建，便於單元測試與 mock
 */
function createRecord(templateId: string, params: RelicRecordCreateParams): RelicRecord {
  const record: RelicRecord = {
    id: 'relic-record-' + nanoid(),
    templateId,
    affixRecords: params.affixRecords,
    currentStacks: params.currentStacks,
    atCreated: params.atCreated,
  }
  return record
}
function createManyRecords(templateIds: string[], params: RelicRecordCreateParams): RelicRecord[] {
  return templateIds.map((templateId) => createRecord(templateId, params))
}
export const RelicRecordFactory = {
  createOne: createRecord,
  createMany: createManyRecords,
}
