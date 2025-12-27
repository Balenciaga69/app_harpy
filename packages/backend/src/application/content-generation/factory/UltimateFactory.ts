import { nanoid } from 'nanoid'
import { UltimateRecord } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
/** UltimateRecord 創建參數 */
export interface UltimateRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}
/** 建立 UltimateRecord */
function createUltimateRecord(templateId: string, params: UltimateRecordCreateParams): UltimateRecord {
  return {
    id: 'ultimate-record-' + nanoid(),
    templateId,
    sourceUnitId: params.sourceUnitId,
    pluginAffixRecord: [],
    atCreated: params.atCreated,
  }
}
/** 批次建立 UltimateRecord */
function createManyUltimateRecords(templateIds: string[], params: UltimateRecordCreateParams): UltimateRecord[] {
  return templateIds.map((templateId) => createUltimateRecord(templateId, params))
}
/** UltimateRecordFactory：負責UltimateRecord的創建 */
export const UltimateRecordFactory = {
  createRecord: createUltimateRecord,
  createManyRecords: createManyUltimateRecords,
}
