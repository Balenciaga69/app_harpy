import { CharacterRecord } from '../../../domain/character/Character'
import { RelicRecord } from '../../../domain/item/Item'
import { UltimateRecord } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { IdGeneratorHelper } from '../../core-infrastructure/id/idGeneratorHelpers'
export interface CharacterRecordCreateParams {
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
function createCharacterRecord(professionId: string, params: CharacterRecordCreateParams): CharacterRecord {
  const record: CharacterRecord = {
    id: IdGeneratorHelper.generateCharacterId(),
    name: params.name,
    professionId,
    relics: params.relics,
    ultimate: params.ultimate,
    gold: params.gold,
    loadCapacity: params.loadCapacity,
    currentLoad: params.currentLoad,
  }
  return record
}
export const CharacterRecordFactory = {
  createOne: createCharacterRecord,
}
