import { RelicInstance } from '../../../domain/item/itemInstance'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { UnitStats } from '../../../domain/stats/models/UnitStats'
import { ICharacterContextRepository } from '../../core-infrastructure/repository/IRepositories'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IStashService, StashOperation } from '../../stash/service/StashService'
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
  /**TODO: 請濃縮成單行
   * 取得角色資訊。
   * - 無副作用。
   */
  getCharacter(characterId: string): Promise<ICharacterContext>

  /**TODO: 請濃縮成單行
   * 根據操作日誌批次更新角色的遺物。
   */
  updateRelicsFromOperations(runId: string, characterId: string, operations: CharacterRelicOperation[]): Promise<void>

  /**TODO: 請濃縮成單行
   * 檢查角色是否可以裝備指定遺物。
   */
  canEquipRelic(characterId: string, relic: RelicInstance): Promise<boolean>

  /**TODO: 請濃縮成單行
   * 檢查角色是否已達負載上限。
   */
  isCharacterAtCapacity(characterId: string): Promise<boolean>

  /**TODO: 請濃縮成單行
   * 裝備或取代角色的大絕招。
   */
  equipUltimate(characterId: string, ultimate: UltimateInstance): Promise<void>

  /**TODO: 請濃縮成單行
   * 取得角色目前裝備的大絕招。
   */
  getUltimate(characterId: string): Promise<UltimateInstance>

  /**TODO: 請濃縮成單行
   * 取得角色目前裝備的遺物列表。
   */
  getEquippedRelics(characterId: string): Promise<RelicInstance[]>

  /** TODO: 請濃縮成單行
   * 計算角色在戰鬥外的默認面板數值。
   */
  calculateCharacterDefaultStats(characterId: string): Promise<UnitStats>
}

/**
 * 內部服務接口 - 只給其他服務使用。
 */
export interface IInternalCharacterService {
  /**TODO: 請濃縮成單行
   * 直接新增遺物到角色。
   */
  addRelicToCharacter(characterId: string, relic: RelicInstance): Promise<void>

  /**TODO: 請濃縮成單行
   * 直接從角色移除遺物。
   */
  removeRelicFromCharacter(characterId: string, relicId: string): Promise<void>

  /**TODO: 請濃縮成單行
   * 直接擴展角色的負重容量。
   */
  expandCharacterCapacity(characterId: string, newCapacity: number): Promise<void>
}

/**
 * 角色服務實作。
 * - 負責處理角色的查詢、裝卸遺物、技能管理等業務邏輯。
 * - 採用操作日誌模式處理高頻裝卸，提升效率。
 * - 與倉庫服務協作，確保物品移轉的一致性。
 */
export class CharacterService implements ICharacterService, IInternalCharacterService {
  private readonly characterRepo: ICharacterContextRepository
  private readonly stashService: IStashService

  constructor(characterRepo: ICharacterContextRepository, stashService: IStashService) {
    this.characterRepo = characterRepo
    this.stashService = stashService
  }

  /**
   * 取得角色資訊。
   * - 無副作用。
   * - 邊界條件：characterId 必須對應有效的角色。
   */
  async getCharacter(characterId: string): Promise<ICharacterContext> {
    const character = await this.characterRepo.getById(characterId)
    if (!character) {
      throw new Error(`Character not found: ${characterId}`)
    }
    return character
  }

  /**
   * 根據操作日誌批次更新角色的遺物。
   * - 邊界條件：
   *   - 操作日誌必須合法。
   *   - 遺物移轉必須與倉庫同步。
   * - 副作用：
   *   - 更新角色的遺物清單。
   *   - 同步更新倉庫（遺物在倉庫與角色間移動）。
   */
  async updateRelicsFromOperations(
    runId: string,
    characterId: string,
    operations: CharacterRelicOperation[]
  ): Promise<void> {
    const character = await this.getCharacter(characterId)
    const stash = await this.stashService.getStash(runId)

    // 驗證操作的合法性
    this.validateRelicOperations(operations, character, stash)

    // 應用操作
    const newRelics = [...character.relics]
    const stashOperations: StashOperation[] = []

    for (const op of operations) {
      if (op.type === 'EQUIP') {
        newRelics.push(op.relic)
        stashOperations.push({ type: 'REMOVE', item: op.relic })
      } else if (op.type === 'UNEQUIP') {
        const idx = newRelics.findIndex((r) => r.id === op.relic.id)
        if (idx !== -1) {
          newRelics.splice(idx, 1)
          stashOperations.push({ type: 'ADD', item: op.relic })
        }
      }
    }

    // 更新角色與倉庫
    const newCharacterCtx: ICharacterContext = { ...character, relics: newRelics }
    await this.characterRepo.update(newCharacterCtx, character.version)
    await this.stashService.updateStashFromOperations(runId, stashOperations, characterId)
  }

  /**
   * 檢查角色是否可以裝備指定遺物。
   */
  async canEquipRelic(characterId: string, relic: RelicInstance): Promise<boolean> {
    const character = await this.getCharacter(characterId)
    return character.canEquipRelic(relic)
  }

  /**
   * 檢查角色是否已達負載上限。
   */
  async isCharacterAtCapacity(characterId: string): Promise<boolean> {
    const character = await this.getCharacter(characterId)
    return character.relics.length >= character.loadCapacity
  }

  /**
   * 裝備或取代角色的大絕招。
   * - 副作用：更新角色的大招。
   */
  async equipUltimate(characterId: string, ultimate: UltimateInstance): Promise<void> {
    const character = await this.getCharacter(characterId)
    const newCharacter: ICharacterContext = { ...character, ultimate }
    await this.characterRepo.update(newCharacter, character.version)
  }

  /**
   * 取得角色目前裝備的大絕招。
   */
  async getUltimate(characterId: string): Promise<UltimateInstance> {
    const character = await this.getCharacter(characterId)
    return character.ultimate
  }

  /**
   * 取得角色目前裝備的遺物列表。
   */
  async getEquippedRelics(characterId: string): Promise<RelicInstance[]> {
    const character = await this.getCharacter(characterId)
    return [...character.relics]
  }

  /**
   * 計算角色在戰鬥外的默認面板數值。
   * - 無副作用。
   */
  async calculateCharacterDefaultStats(characterId: string): Promise<UnitStats> {
    const character = await this.getCharacter(characterId)
    // TODO: 實作黑盒子邏輯，將遺物詞綴轉換為屬性修飾
    return character.calculateDefaultStats()
  }

  // ===== 內部服務方法 - 只給其他服務使用 =====

  /**
   * 直接新增遺物到角色。
   * - 副作用：更新角色的遺物清單。
   * - 邊界條件：遺物不超過容量限制。
   */
  async addRelicToCharacter(characterId: string, relic: RelicInstance): Promise<void> {
    const character = await this.getCharacter(characterId)
    if (!character.canEquipRelic(relic)) {
      throw new Error('Cannot equip relic: exceeds capacity or already equipped')
    }
    const newRelics = [...character.relics, relic]
    const newCharacter: ICharacterContext = { ...character, relics: newRelics }
    await this.characterRepo.update(newCharacter, character.version)
  }

  /**
   * 直接從角色移除遺物。
   * - 副作用：更新角色的遺物清單。
   * - 邊界條件：遺物必須存在於角色中。
   */
  async removeRelicFromCharacter(characterId: string, relicId: string): Promise<void> {
    const character = await this.getCharacter(characterId)
    const idx = character.relics.findIndex((r) => r.id === relicId)
    if (idx === -1) {
      throw new Error('Relic not found in character inventory')
    }
    const newRelics = character.relics.filter((r) => r.id !== relicId)
    const newCharacter: ICharacterContext = { ...character, relics: newRelics }
    await this.characterRepo.update(newCharacter, character.version)
  }

  /**
   * 直接擴展角色的負重容量。
   * - 副作用：更新角色的容量。
   * - 邊界條件：新容量必須大於當前容量。
   */
  async expandCharacterCapacity(characterId: string, newCapacity: number): Promise<void> {
    const character = await this.getCharacter(characterId)
    if (newCapacity <= character.capacity) {
      throw new Error('New capacity must be greater than current capacity')
    }
    const newCharacter: ICharacterContext = { ...character, loadCapacity: newCapacity }
    await this.characterRepo.update(newCharacter, character.version)
  }

  /**
   * 驗證操作日誌的合法性。
   * - 檢查容量限制。
   * - 檢查遺物來源的合法性。
   */
  private validateRelicOperations(
    operations: CharacterRelicOperation[],
    character: ICharacterContext,
    stash: IStashContext
  ): void {
    // 計算最終的遺物狀態
    let relicCount = character.relics.length
    const relicIds = new Set(character.relics.map((r) => r.id))

    for (const op of operations) {
      if (op.type === 'EQUIP') {
        // 檢查容量
        if (relicCount >= character.loadCapacity) {
          throw new Error('Character at capacity')
        }
        // 檢查遺物是否已存在於角色
        if (relicIds.has(op.relic.id)) {
          throw new Error(`Relic already equipped: ${op.relic.id}`)
        }
        // 檢查遺物是否存在於倉庫
        if (!stash.items.some((i) => i.id === op.relic.id)) {
          throw new Error(`Relic not found in stash: ${op.relic.id}`)
        }
        relicCount++
        relicIds.add(op.relic.id)
      } else if (op.type === 'UNEQUIP') {
        // 檢查遺物是否存在於角色
        if (!relicIds.has(op.relic.id)) {
          throw new Error(`Relic not equipped: ${op.relic.id}`)
        }
        relicCount--
        relicIds.delete(op.relic.id)
      }
    }
  }
}
