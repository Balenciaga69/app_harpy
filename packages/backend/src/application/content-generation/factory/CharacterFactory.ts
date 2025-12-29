import { nanoid } from 'nanoid'
import { CharacterRecord } from '../../../domain/character/Character'
import { RelicRecord } from '../../../domain/item/Item'
import { UltimateRecord } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'

/** CharacterRecord 創建參數 */
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
}

/**
 * CharacterRecordFactory：負責 CharacterRecord 的創建
 * - 單一職責：生成帶有唯一 ID 與創建背景的 CharacterRecord
 * - 無副作用：純粹的資料構建，便於單元測試與 mock
 */
function createCharacterRecord(professionId: string, params: CharacterRecordCreateParams): CharacterRecord {
  const record: CharacterRecord = {
    id: 'character-record-' + nanoid(),
    name: params.name,
    professionId,
    relics: params.relics,
    ultimate: params.ultimate,
    loadCapacity: params.loadCapacity,
    currentLoad: params.currentLoad,
  }
  return record
}

export const CharacterRecordFactory = {
  createOne: createCharacterRecord,
}
