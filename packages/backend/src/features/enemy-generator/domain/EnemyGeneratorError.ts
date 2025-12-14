export class EnemyGeneratorError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnemyGeneratorError'
    Object.setPrototypeOf(this, EnemyGeneratorError.prototype)
  }
}
