import { AffixRecord } from '../../../domain/affix/Affix'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
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
export const AffixRecordFactory = {
  createOne: createRecord,
  createMany: createManyRecords,
}
