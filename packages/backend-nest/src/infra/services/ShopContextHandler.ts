import { Injectable } from '@nestjs/common'
import { InMemoryContextRepository } from '../repositories/InMemoryContextRepository'
@Injectable()
export class ShopContextHandler {
  constructor(private readonly repository: InMemoryContextRepository) {}
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
