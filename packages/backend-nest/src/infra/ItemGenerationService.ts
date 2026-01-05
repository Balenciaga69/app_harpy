import { Injectable } from '@nestjs/common'
import { ConfigService } from '../run/config.service'
/**
 * 快速實現的物品生成服務
 * 用途：MVP 快速開發，簡化邏輯
 */
@Injectable()
export class ItemGenerationService {
  constructor(private readonly configService: ConfigService) {}
  async generateRandomItemFromShop() {
    const configStore = await this.configService.getConfigStore()
    const relics = configStore.itemStore.getAllRelics()
    const randomIndex = Math.floor(Math.random() * relics.length)
    return relics[randomIndex]
  }
  async generateRandomItemFromReward(rewardType: string) {
    const configStore = await this.configService.getConfigStore()
    const relics = configStore.itemStore.getAllRelics()
    const randomIndex = Math.floor(Math.random() * relics.length)
    return relics[randomIndex]
  }
  async generateItemFromTemplate(templateId: string, _itemType: string) {
    const configStore = await this.configService.getConfigStore()
    return configStore.itemStore.getRelic(templateId)
  }
}
