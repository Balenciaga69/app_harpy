import { UltimateRecord } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface UltimateRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}
function createUltimateRecord(templateId: string, params: UltimateRecordCreateParams): UltimateRecord {
  return {
    id: IdGeneratorHelper.generateUltimateRecordId(),
    templateId,
    sourceUnitId: params.sourceUnitId,
    pluginAffixRecord: [],
    atCreated: params.atCreated,
  }
}
function createManyUltimateRecords(templateIds: string[], params: UltimateRecordCreateParams): UltimateRecord[] {
  return templateIds.map((templateId) => createUltimateRecord(templateId, params))
}
export const UltimateRecordFactory = {
  createOne: createUltimateRecord,
  createMany: createManyUltimateRecords,
}
