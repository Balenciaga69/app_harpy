import { RelicInstance } from '../../../domain/item/Item'
import { UnitStats } from '../../../domain/stats/models/UnitStats'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
/**
 * 角色與遺物的操作日誌。
 * - type: 'EQUIP' 表示裝備遺物，'UNEQUIP' 表示卸下遺物。
 * - relicId: 操作的遺物 ID。
 * 相同遺物的 EQUIP 與 UNEQUIP 會互相抵銷，提升高頻操作的效率。
 */
export interface CharacterRelicOperation {
  type: 'EQUIP' | 'UNEQUIP'
  relic: RelicInstance
}
/**
 * 角色服務的公開介面。
 * - 提供角色相關的業務邏輯操作。
 * - 分為用戶版本（操作日誌）與內部版本（直接操作）。
 */
export interface ICharacterService {
  // 取得角色資訊。無副作用。
  getCharacterContext(characterId: string): Promise<ICharacterContext>
  // 根據操作日誌批次更新角色的遺物。
  updateRelicsFromOperations(runId: string, characterId: string, operations: CharacterRelicOperation[]): Promise<void>
  // 檢查角色是否可以裝備指定遺物。
  canEquipRelic(characterId: string, relic: RelicInstance): Promise<boolean>
  // 檢查角色是否已達負載上限。
  isCharacterAtCapacity(characterId: string): Promise<boolean>
  // 裝備或取代角色的大絕招。
  equipUltimate(characterId: string, ultimate: UltimateInstance): Promise<void>
  // 取得角色目前裝備的大絕招。
  getUltimate(characterId: string): Promise<UltimateInstance>
  // 取得角色目前裝備的遺物列表。
  getEquippedRelics(characterId: string): Promise<RelicInstance[]>
  // 計算角色在戰鬥外的默認面板數值。
  calculateCharacterDefaultStats(characterId: string): Promise<UnitStats>
}
/**
 * 內部服務接口 - 只給其他服務使用。
 */
export interface IInternalCharacterService {
  // 直接新增遺物到角色。
  addRelicToCharacter(characterId: string, relic: RelicInstance): Promise<void>
  // 直接從角色移除遺物。
  removeRelicFromCharacter(characterId: string, relicId: string): Promise<void>
  // 直接擴展角色的負重容量。
  expandCharacterCapacity(characterId: string, newCapacity: number): Promise<void>
}
