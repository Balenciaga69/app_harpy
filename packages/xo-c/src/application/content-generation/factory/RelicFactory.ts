import { AffixRecord } from '../../../domain/affix/Affix'
import { RelicRecord } from '../../../domain/item/Item'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface RelicRecordCreateParameters {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
  affixRecords: ReadonlyArray<AffixRecord>
}
function createRecord(templateId: string, parameters: RelicRecordCreateParameters): RelicRecord {
  const record: RelicRecord = {
    id: IdGeneratorHelper.generateRelicRecordId(),
    templateId,
    affixRecords: parameters.affixRecords,
    atCreated: parameters.atCreated,
    itemType: 'RELIC',
  }
  return record
}
function createManyRecords(templateIds: string[], parameters: RelicRecordCreateParameters): RelicRecord[] {
  return templateIds.map((templateId) => createRecord(templateId, parameters))
}
export const RelicRecordFactory = {
  createOne: createRecord,
  createMany: createManyRecords,
}
