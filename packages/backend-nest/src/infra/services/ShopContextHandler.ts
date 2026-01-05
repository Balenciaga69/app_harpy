import { Injectable } from '@nestjs/common'
import { InMemoryContextRepository } from '../repositories/InMemoryContextRepository'
import { ConfigService } from '../../features/run/services/config.service'
/**
 * 快速實現的商店上下文處理器
 * 用途：MVP 快速開發
 */
@Injectable()
export class ShopContextHandler {
  constructor(
    private readonly repository: InMemoryContextRepository,
    private readonly configService: ConfigService
  ) {}
  async loadShopContext(runId: string) {
    return this.repository.getShopContext(runId)
  }
  async saveShopContext(runId: string, context: any) {
    await this.repository.updateShopContext(runId, context)
    return true
  }
  async getRunState(runId: string) {
    return this.repository.getRunContext(runId)
  }
}
