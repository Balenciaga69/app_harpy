import { CharacterRecord } from '../../../domain/character/Character'
import { RelicRecord } from '../../../domain/item/Item'
import { UltimateRecord } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface CharacterRecordCreateParameters {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
  name: string
  professionId: string
  relics: ReadonlyArray<RelicRecord>
  ultimate: UltimateRecord
  loadCapacity: number
  currentLoad: number
  gold: number
}
function createCharacterRecord(professionId: string, parameters: CharacterRecordCreateParameters): CharacterRecord {
  const record: CharacterRecord = {
    id: IdGeneratorHelper.generateCharacterId(),
    name: parameters.name,
    professionId,
    relics: parameters.relics,
    ultimate: parameters.ultimate,
    gold: parameters.gold,
    loadCapacity: parameters.loadCapacity,
    currentLoad: parameters.currentLoad,
  }
  return record
}
export const CharacterRecordFactory = {
  createOne: createCharacterRecord,
}
