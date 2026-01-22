import { AffixRecord } from '../../../domain/affix/Affix'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface AffixRecordCreateParameters {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}
function createRecord(templateId: string, parameters: AffixRecordCreateParameters): AffixRecord {
  return {
    id: IdGeneratorHelper.generateAffixRecordId(),
    templateId,
    sourceUnitId: parameters.sourceUnitId,
    atCreated: parameters.atCreated,
  }
}
function createManyRecords(templateIds: string[], parameters: AffixRecordCreateParameters): AffixRecord[] {
  return templateIds.map((templateId) => createRecord(templateId, parameters))
}
export const AffixRecordFactory = {
  createOne: createRecord,
  createMany: createManyRecords,
}
