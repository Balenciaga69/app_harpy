export abstract class GameError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
export class ConfigNotFoundError extends GameError {
  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} 配置不存在: ${resourceId}`, 'CONFIG_NOT_FOUND')
  }
}
