import { EnemyGeneratorError } from './EnemyGeneratorError'

export class InvalidEnemyConfigError extends EnemyGeneratorError {
  constructor(reason: string) {
    super(`Invalid enemy generation config: ${reason}`)
    this.name = 'InvalidEnemyConfigError'
    Object.setPrototypeOf(this, InvalidEnemyConfigError.prototype)
  }
}
