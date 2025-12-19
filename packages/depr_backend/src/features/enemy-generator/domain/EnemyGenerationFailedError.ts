import { EnemyGeneratorError } from './EnemyGeneratorError'

export class EnemyGenerationFailedError extends EnemyGeneratorError {
  constructor(reason: string) {
    super(`Enemy generation failed: ${reason}`)
    this.name = 'EnemyGenerationFailedError'
    Object.setPrototypeOf(this, EnemyGenerationFailedError.prototype)
  }
}
