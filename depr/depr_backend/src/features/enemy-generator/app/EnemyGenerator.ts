import seedrandom from 'seedrandom'
import { nanoid } from 'nanoid'
import type {
  IEnemyGenerator,
  IEnemyGenerationConfig,
  IEnemyInstance,
  IEnemyDefinitionRegistry,
} from '../interfaces'
import {
  InvalidEnemyConfigError,
  EnemyGenerationFailedError,
  EnemyGeneratorConstants,
} from '../domain'
import type { ICharacterInstanceFactory } from '../../../game-play/character-manager'
import type { ItemGenerator } from '../../item-generator'

export class EnemyGenerator implements IEnemyGenerator {
  private readonly definitionRegistry: IEnemyDefinitionRegistry
  private readonly characterFactory: ICharacterInstanceFactory
  private readonly itemGenerator: ItemGenerator

  constructor(
    definitionRegistry: IEnemyDefinitionRegistry,
    characterFactory: ICharacterInstanceFactory,
    itemGenerator: ItemGenerator,
  ) {
    this.definitionRegistry = definitionRegistry
    this.characterFactory = characterFactory
    this.itemGenerator = itemGenerator
  }

  async generateEnemies(
    config: IEnemyGenerationConfig,
  ): Promise<IEnemyInstance[]> {
    this.validateConfig(config)

    const rng = config.seed ? seedrandom(config.seed) : seedrandom()
    const enemies: IEnemyInstance[] = []

    const availableDefinitions = this.filterDefinitions(config)

    if (availableDefinitions.length === 0) {
      throw new EnemyGenerationFailedError('No available enemy definitions')
    }

    for (let i = 0; i < config.enemyCount; i++) {
      const definition = this.selectDefinition(availableDefinitions, config, rng)
      const enemy = await this.generateSingleEnemy(definition, config, rng)
      enemies.push(enemy)
    }

    return enemies
  }

  private validateConfig(config: IEnemyGenerationConfig): void {
    if (config.enemyCount < EnemyGeneratorConstants.MIN_ENEMY_COUNT) {
      throw new InvalidEnemyConfigError(
        `Enemy count must be at least ${EnemyGeneratorConstants.MIN_ENEMY_COUNT}`,
      )
    }

    if (config.enemyCount > EnemyGeneratorConstants.MAX_ENEMY_COUNT) {
      throw new InvalidEnemyConfigError(
        `Enemy count cannot exceed ${EnemyGeneratorConstants.MAX_ENEMY_COUNT}`,
      )
    }

    if (config.difficulty < 0) {
      throw new InvalidEnemyConfigError('Difficulty must be non-negative')
    }
  }

  private filterDefinitions(config: IEnemyGenerationConfig) {
    let definitions = this.definitionRegistry.getAll()

    if (config.allowedEnemyIds && config.allowedEnemyIds.length > 0) {
      definitions = definitions.filter((def) =>
        config.allowedEnemyIds!.includes(def.id),
      )
    }

    const minThreat =
      config.minThreatLevel ?? EnemyGeneratorConstants.DEFAULT_MIN_THREAT
    const maxThreat =
      config.maxThreatLevel ?? EnemyGeneratorConstants.DEFAULT_MAX_THREAT

    definitions = definitions.filter(
      (def) => def.threatLevel >= minThreat && def.threatLevel <= maxThreat,
    )

    return definitions
  }

  private selectDefinition(
    definitions: typeof this.definitionRegistry extends IEnemyDefinitionRegistry
      ? ReturnType<IEnemyDefinitionRegistry['getAll']>
      : never,
    config: IEnemyGenerationConfig,
    rng: ReturnType<typeof seedrandom>,
  ) {
    if (config.classPreferences) {
      const weights = definitions.map(
        (def) => config.classPreferences![def.classId] ?? 1,
      )
      const totalWeight = weights.reduce((sum, w) => sum + w, 0)
      const random = rng() * totalWeight

      let cumulative = 0
      for (let i = 0; i < definitions.length; i++) {
        cumulative += weights[i]
        if (random <= cumulative) {
          return definitions[i]
        }
      }
    }

    const index = Math.floor(rng() * definitions.length)
    return definitions[index]
  }

  private async generateSingleEnemy(
    definition: ReturnType<IEnemyDefinitionRegistry['get']>,
    config: IEnemyGenerationConfig,
    rng: ReturnType<typeof seedrandom>,
  ): Promise<IEnemyInstance> {
    if (!definition) {
      throw new EnemyGenerationFailedError('Invalid enemy definition')
    }

    const character = await this.characterFactory.createInstance(
      definition.classId,
    )

    const equipmentCount = Math.floor(
      EnemyGeneratorConstants.EQUIPMENT_COUNT_BASE +
        config.difficulty * 0.5,
    )
    const relicCount = Math.floor(
      EnemyGeneratorConstants.RELIC_COUNT_BASE +
        config.difficulty *
          EnemyGeneratorConstants.RELIC_COUNT_PER_DIFFICULTY,
    )

    const equipmentIds: string[] = []
    const relicIds: string[] = []

    return {
      character,
      definitionId: definition.id,
      difficulty: config.difficulty,
      equipmentIds,
      relicIds,
      threatLevel: definition.threatLevel,
    }
  }
}
