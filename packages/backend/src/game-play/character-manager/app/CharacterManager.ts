import type {
  ICharacterManager,
  ICharacterInstance,
  ICharacterPanelData,
  ICharacterSelectionResult,
  ICharacterInstanceFactory,
  ICharacterPanelCalculator,
  ICharacterStorage,
} from '../interfaces'
import { CharacterNotFoundError } from '../domain'
import type { IEventBus } from '../../../shared/event-bus'
import type { ICharacterManagerEvents } from '../interfaces'

/* 角色管理器 */
export class CharacterManager implements ICharacterManager {
  private readonly characterStorage: ICharacterStorage
  private readonly instanceFactory: ICharacterInstanceFactory
  private readonly panelCalculator: ICharacterPanelCalculator
  private readonly eventBus: IEventBus<ICharacterManagerEvents>
  private readonly getAvailableDefinitions: () => unknown[]

  constructor(
    characterStorage: ICharacterStorage,
    instanceFactory: ICharacterInstanceFactory,
    panelCalculator: ICharacterPanelCalculator,
    eventBus: IEventBus<ICharacterManagerEvents>,
    getAvailableDefinitions: () => unknown[]
  ) {
    this.characterStorage = characterStorage
    this.instanceFactory = instanceFactory
    this.panelCalculator = panelCalculator
    this.eventBus = eventBus
    this.getAvailableDefinitions = getAvailableDefinitions
  }

  /* 根據角色定義 ID 創建角色實例 */
  async createCharacter(characterDefinitionId: string): Promise<ICharacterInstance> {
    const instance = await this.instanceFactory.createInstance(characterDefinitionId)

    await this.characterStorage.save(instance)

    this.eventBus.emit('character:created', { character: instance })

    return instance
  }

  /* 根據角色 ID 載入角色實例 */
  async loadCharacter(characterId: string): Promise<ICharacterInstance> {
    const character = await this.characterStorage.load(characterId)

    if (!character) {
      throw new CharacterNotFoundError(characterId)
    }

    this.eventBus.emit('character:loaded', { character })

    return character
  }

  /* 儲存角色實例 */
  async saveCharacter(character: ICharacterInstance): Promise<void> {
    character.updatedAt = new Date()

    await this.characterStorage.save(character)

    this.eventBus.emit('character:saved', { characterId: character.id })
  }

  /* 獲取可用角色定義列表 */
  getAvailableCharacters(): unknown[] {
    return this.getAvailableDefinitions()
  }

  /* 選擇角色 */
  async selectCharacter(characterId: string): Promise<ICharacterSelectionResult> {
    try {
      const character = await this.loadCharacter(characterId)

      this.eventBus.emit('character:selected', { character })

      return {
        success: true,
        character,
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  /* 獲取角色面板數據 */
  async getCharacterPanel(characterId: string): Promise<ICharacterPanelData> {
    const exists = await this.characterStorage.exists(characterId)
    if (!exists) {
      throw new CharacterNotFoundError(characterId)
    }

    return await this.panelCalculator.calculatePanel(characterId)
  }

  /* 更新角色狀態 */
  async updateCharacterStatus(characterId: string): Promise<void> {
    const character = await this.loadCharacter(characterId)

    character.updatedAt = new Date()

    await this.characterStorage.save(character)

    this.eventBus.emit('character:updated', { characterId })
  }
}
