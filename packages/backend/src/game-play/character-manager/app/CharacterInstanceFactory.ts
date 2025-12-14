import { nanoid } from 'nanoid'
import type { ICharacterInstance, ICharacterInstanceFactory } from '../interfaces'
import { CharacterStatus } from '../interfaces'
import { CharacterDefinitionNotFoundError } from '../domain'
import type { BaseAttributeValues } from '../../../features/attribute'

/* 角色實例工廠 */
export class CharacterInstanceFactory implements ICharacterInstanceFactory {
  private readonly getCharacterDefinition: (definitionId: string) => Promise<unknown | null>
  private readonly createInventory: () => Promise<string>

  constructor(
    getCharacterDefinition: (definitionId: string) => Promise<unknown | null>,
    createInventory: () => Promise<string>
  ) {
    this.getCharacterDefinition = getCharacterDefinition
    this.createInventory = createInventory
  }

  /* 根據角色定義 ID 創建角色實例 */
  async createInstance(characterDefinitionId: string): Promise<ICharacterInstance> {
    const definition = await this.getCharacterDefinition(characterDefinitionId)

    if (!definition) {
      throw new CharacterDefinitionNotFoundError(characterDefinitionId)
    }

    // 待 Character 模組完成後，這裡需要從 definition 提取基礎屬性
    const baseAttributes = this.extractBaseAttributes(definition)

    const inventoryId = await this.createInventory()

    const now = new Date()
    const instance: ICharacterInstance = {
      id: nanoid(),
      definitionId: characterDefinitionId,
      currentAttributes: baseAttributes,
      inventoryId,
      status: CharacterStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    }

    return instance
  }

  /* 從角色定義提取基礎屬性 */
  private extractBaseAttributes(_definition: unknown): BaseAttributeValues {
    // TODO: 待 Character 模組完成後實作
    // 目前返回預設值
    return {
      maxHp: 100,
      currentHp: 100,
      maxEnergy: 100,
      currentEnergy: 0,
      energyRegen: 5,
      energyGainOnAttack: 10,
      attackDamage: 15,
      attackCooldown: 1000,
      armor: 10,
      evasion: 5,
      accuracy: 95,
      criticalChance: 10,
      criticalMultiplier: 1.5,
      resurrectionChance: 3,
      resurrectionHpPercent: 10,
    }
  }
}
