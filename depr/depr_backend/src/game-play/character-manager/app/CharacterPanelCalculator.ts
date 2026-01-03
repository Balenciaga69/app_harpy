import type { ICharacterPanelCalculator, ICharacterPanelData, ICharacterStorage } from '../interfaces'
import { CharacterNotFoundError } from '../domain'
import type { ICharacterStatistics } from '../interfaces'
import { CharacterManagerConstants } from '../domain'

/* 角色面板計算器 */
export class CharacterPanelCalculator implements ICharacterPanelCalculator {
  private readonly characterStorage: ICharacterStorage
  private readonly getCharacterDefinition: (definitionId: string) => Promise<unknown | null>
  private readonly getInventoryData: (inventoryId: string) => Promise<unknown | null>
  private readonly calculateAttributes: (characterId: string) => Promise<unknown>

  constructor(
    characterStorage: ICharacterStorage,
    getCharacterDefinition: (definitionId: string) => Promise<unknown | null>,
    getInventoryData: (inventoryId: string) => Promise<unknown | null>,
    calculateAttributes: (characterId: string) => Promise<unknown>
  ) {
    this.characterStorage = characterStorage
    this.getCharacterDefinition = getCharacterDefinition
    this.getInventoryData = getInventoryData
    this.calculateAttributes = calculateAttributes
  }

  /* 計算並生成角色面板數據 */
  async calculatePanel(characterId: string): Promise<ICharacterPanelData> {
    const character = await this.characterStorage.load(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    // 獲取角色定義資訊
    const definition = await this.getCharacterDefinition(character.definitionId)
    if (!definition) {
      throw new Error(
        CharacterManagerConstants.ERROR_MESSAGES.DEFINITION_NOT_FOUND.replace('{0}', character.definitionId)
      )
    }

    // 獲取背包數據
    const inventoryData = await this.getInventoryData(character.inventoryId)
    if (!inventoryData) {
      throw new Error(
        CharacterManagerConstants.ERROR_MESSAGES.INVENTORY_NOT_FOUND.replace('{0}', character.inventoryId)
      )
    }

    // 計算最終屬性（需要整合裝備、遺物等）
    await this.calculateAttributes(characterId)

    // 提取基本資訊
    const basicInfo = this.extractBasicInfo(definition, characterId)

    // 提取統計資訊
    const statistics = this.extractStatistics()

    const panelData: ICharacterPanelData = {
      basicInfo,
      attributes: character.currentAttributes,
      equipment: {}, // TODO: 待 Inventory 模組完成後實作
      relics: [], // TODO: 待 Inventory 模組完成後實作
      status: character.status,
      statistics,
    }

    return panelData
  }

  /* 提取角色基本資訊 */
  private extractBasicInfo(_definition: unknown, characterId: string): { id: string; name: string; className: string } {
    // TODO: 待 Character 模組完成後實作
    // 目前返回預設值
    return {
      id: characterId,
      name: 'Unknown Character',
      className: 'Unknown Class',
    }
  }

  /* 提取角色統計資訊 */
  private extractStatistics(): ICharacterStatistics {
    // TODO: 待統計系統實作後完成
    // 目前返回預設值
    return {
      totalCombats: CharacterManagerConstants.DEFAULTS.TOTAL_COMBATS,
      victories: CharacterManagerConstants.DEFAULTS.VICTORIES,
      defeats: CharacterManagerConstants.DEFAULTS.DEFEATS,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalHealing: 0,
      reviveCount: CharacterManagerConstants.DEFAULTS.REVIVE_COUNT,
    }
  }
}
