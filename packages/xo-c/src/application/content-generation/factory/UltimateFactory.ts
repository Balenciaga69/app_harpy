import { UltimateRecord } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface UltimateRecordCreateParameters {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}
function createUltimateRecord(templateId: string, parameters: UltimateRecordCreateParameters): UltimateRecord {
  return {
    id: IdGeneratorHelper.generateUltimateRecordId(),
    templateId,
    sourceUnitId: parameters.sourceUnitId,
    pluginAffixRecord: [],
    atCreated: parameters.atCreated,
  }
}
function createManyUltimateRecords(templateIds: string[], parameters: UltimateRecordCreateParameters): UltimateRecord[] {
  return templateIds.map((templateId) => createUltimateRecord(templateId, parameters))
}
export const UltimateRecordFactory = {
  createOne: createUltimateRecord,
  createMany: createManyUltimateRecords,
}
