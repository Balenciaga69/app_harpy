import { Character, ICharacter } from '../../../domain/character/Character'
import { RelicInstance } from '../../../domain/item/itemInstance'
import { UnitStatModifier } from '../../../domain/stats/models/StatModifier'
import { DEFAULT_UNIT_STATS, UnitStats } from '../../../domain/stats/models/UnitStats'
import { UnitStatAggregate } from '../../../domain/stats/UnitStatAggregate'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
import { ICharacterContext } from '../../core-infrastructure/context/interface/ICharacterContext'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { ICharacterContextRepository } from '../../core-infrastructure/repository/IRepositories'
import { IStashService, StashOperation } from '../../stash/service/StashService'
import { CharacterRelicOperation, ICharacterService, IInternalCharacterService } from './ICharacterService'

/**
 * 角色服務實作。
 * - 負責處理角色的查詢、裝卸遺物、技能管理等業務邏輯。
 * - 採用操作日誌模式處理高頻裝卸，提升效率。
 * - 與倉庫服務協作，確保物品移轉的一致性。
 */
export class CharacterService implements ICharacterService, IInternalCharacterService {
  private readonly characterRepo: ICharacterContextRepository
  private readonly stashService: IStashService
  private readonly appContextService: IAppContextService
  constructor(
    characterRepo: ICharacterContextRepository,
    stashService: IStashService,
    appContextService: IAppContextService
  ) {
    this.characterRepo = characterRepo
    this.stashService = stashService
    this.appContextService = appContextService
  }
  /**
   * 取得角色資訊。
   * - 無副作用。
   * - 邊界條件：characterId 必須對應有效的角色。
   */
  async getCharacterContext(characterId: string): Promise<ICharacterContext> {
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
    // TODO: 這裡是必要重構, 但先不管 我們先討論其他
    runId: string,
    characterId: string,
    operations: CharacterRelicOperation[]
  ): Promise<void> {
    const characterContext = await this.getCharacterContext(characterId)
    const stash = await this.stashService.getStash(runId)
    // 驗證操作的合法性
    this.validateRelicOperations(operations, characterContext, stash)
    // 應用操作
    const newRelics = [...characterContext.relics]
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
    const newCharacterContextCtx: ICharacterContext = { ...characterContext, relics: newRelics }
    await this.characterRepo.update(newCharacterContextCtx, characterContext.version)
    await this.stashService.updateStashFromOperations(runId, stashOperations, characterId)
  }
  /**
   * 檢查角色是否可以裝備指定遺物。
   */
  async canEquipRelic(characterId: string, instance: RelicInstance): Promise<boolean> {
    const characterContext = await this.getCharacterContext(characterId)
    const template = this.appContextService.GetConfig().itemStore.getRelic(instance.templateId)
    if (!template) {
      throw new Error(`Relic template not found: ${instance.templateId}`)
    }
    const character = this.mapToCharacter(characterContext)
    return character.canEquipRelic(instance, template)
  }
  /**
   * 檢查角色是否已達負載上限。
   */
  async isCharacterAtCapacity(characterId: string): Promise<boolean> {
    const characterContext = await this.getCharacterContext(characterId)
    return characterContext.relics.length >= characterContext.loadCapacity
  }
  /**
   * 裝備或取代角色的大絕招。
   * - 副作用：更新角色的大招。
   */
  async equipUltimate(characterId: string, ultimate: UltimateInstance): Promise<void> {
    const characterContext = await this.getCharacterContext(characterId)
    const newCharacterContext: ICharacterContext = { ...characterContext, ultimate }
    await this.characterRepo.update(newCharacterContext, characterContext.version)
  }
  /**
   * 取得角色目前裝備的大絕招。
   */
  async getUltimate(characterId: string): Promise<UltimateInstance> {
    const characterContext = await this.getCharacterContext(characterId)
    return characterContext.ultimate
  }
  /**
   * 取得角色目前裝備的遺物列表。
   */
  async getEquippedRelics(characterId: string): Promise<RelicInstance[]> {
    const characterContext = await this.getCharacterContext(characterId)
    return [...characterContext.relics]
  }
  /**
   * 計算角色在戰鬥外的默認面板數值。
   * - 無副作用。
   */
  async calculateCharacterDefaultStats(characterId: string): Promise<UnitStats> {
    const characterContext = await this.getCharacterContext(characterId)
    // TODO: 超級爛 code ,多層迴圈, 職責也不再這裡, 存取太多 store 也需要調製
    const statModifiers: UnitStatModifier[] = []
    const { affixStore } = this.appContextService.GetConfig()
    const { relics: instances } = characterContext
    for (const instance of instances) {
      for (const affixInstance of instance.affixInstances) {
        const affixTemplate = affixStore.getAffix(affixInstance.templateId)
        if (!affixTemplate) continue
        for (const effectId of affixTemplate.effectIds) {
          const effectTemplate = affixStore.getAffixEffect(effectId)
          if (!effectTemplate) continue
          const { difficulty } = affixInstance.atCreated
          if (effectTemplate.trigger !== 'ON_EQUIP') continue
          const statModifyEffects = effectTemplate.actions.filter((e) => e.type === 'STAT_MODIFY')
          for (const statModifyEffect of statModifyEffects) {
            const computedAffixMultiplier =
              !!statModifyEffect.affixMultiplier && statModifyEffect.affixMultiplier > 0
                ? statModifyEffect.affixMultiplier * difficulty
                : 1
            const statModifier: UnitStatModifier = {
              field: statModifyEffect.stat,
              operation: statModifyEffect.operation,
              value: statModifyEffect.value * computedAffixMultiplier * difficulty,
            }
            statModifiers.push(statModifier)
          }
        }
      }
    }
    const unitStatAggregate = UnitStatAggregate(DEFAULT_UNIT_STATS, statModifiers)
    return unitStatAggregate
  }
  // ===== 內部服務方法 - 只給其他服務使用 =====
  /**
   * 直接新增遺物到角色。
   * - 副作用：更新角色的遺物清單。
   * - 邊界條件：遺物不超過容量限制。
   */
  async addRelicToCharacter(characterId: string, relicInstance: RelicInstance): Promise<void> {
    const characterContext = await this.getCharacterContext(characterId)
    const character = this.mapToCharacter(characterContext)
    const template = this.appContextService.GetConfig().itemStore.getRelic(relicInstance.templateId)
    if (!template) {
      throw new Error(`Relic template not found: ${relicInstance.templateId}`)
    }
    if (!character.canEquipRelic(relicInstance, template)) {
      throw new Error('Cannot equip relic: exceeds capacity or already equipped')
    }
    const newRelics = [...characterContext.relics, relicInstance]
    const newCharacterContext: ICharacterContext = { ...characterContext, relics: newRelics }
    await this.characterRepo.update(newCharacterContext, characterContext.version)
  }
  /**
   * 直接從角色移除遺物。
   * - 副作用：更新角色的遺物清單。
   * - 邊界條件：遺物必須存在於角色中。
   */
  async removeRelicFromCharacter(characterId: string, relicId: string): Promise<void> {
    const characterContext = await this.getCharacterContext(characterId)
    const idx = characterContext.relics.findIndex((r) => r.id === relicId)
    if (idx === -1) {
      throw new Error('Relic not found in character inventory')
    }
    const newRelics = characterContext.relics.filter((r) => r.id !== relicId)
    const newCharacterContext: ICharacterContext = { ...characterContext, relics: newRelics }
    await this.characterRepo.update(newCharacterContext, characterContext.version)
  }
  /**
   * 直接擴展角色的負重容量。
   * - 副作用：更新角色的容量。
   * - 邊界條件：新容量必須大於當前容量。
   */
  async expandCharacterCapacity(characterId: string, newCapacity: number): Promise<void> {
    const characterContext = await this.getCharacterContext(characterId)
    if (newCapacity <= characterContext.loadCapacity) {
      throw new Error('New capacity must be greater than current capacity')
    }
    const newCharacterContext: ICharacterContext = { ...characterContext, loadCapacity: newCapacity }
    await this.characterRepo.update(newCharacterContext, characterContext.version)
  }
  /**
   * 驗證操作日誌的合法性。
   * - 檢查容量限制。
   * - 檢查遺物來源的合法性。
   */
  private validateRelicOperations(
    operations: CharacterRelicOperation[],
    characterContext: ICharacterContext,
    stash: IStashContext
  ): void {
    // 計算最終的遺物狀態
    let relicCount = characterContext.relics.length
    const relicIds = new Set(characterContext.relics.map((r) => r.id))
    for (const op of operations) {
      if (op.type === 'EQUIP') {
        // 檢查容量
        if (relicCount >= characterContext.loadCapacity) {
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

  private mapToCharacter(characterContext: ICharacterContext): ICharacter {
    const character = new Character(
      characterContext.characterId,
      characterContext.name,
      characterContext.professionId,
      characterContext.ultimate,
      characterContext.loadCapacity
    )
    return character
  }
}
