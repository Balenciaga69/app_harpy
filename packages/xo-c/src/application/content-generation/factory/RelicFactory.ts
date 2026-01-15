import { AffixRecord } from '../../../domain/affix/Affix'
import { RelicRecord } from '../../../domain/item/Item'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface RelicRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
  affixRecords: ReadonlyArray<AffixRecord>
}
function createRecord(templateId: string, params: RelicRecordCreateParams): RelicRecord {
  const record: RelicRecord = {
    id: IdGeneratorHelper.generateRelicRecordId(),
    templateId,
    affixRecords: params.affixRecords,
    atCreated: params.atCreated,
    itemType: 'RELIC',
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
