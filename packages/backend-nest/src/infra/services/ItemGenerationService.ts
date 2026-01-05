import { Injectable } from '@nestjs/common'
import { ConfigService } from '../../features/run/services/config.service'
@Injectable()
export class ItemGenerationService {
  constructor(private readonly configService: ConfigService) {}
  async generateRandomItemFromShop() {
    const configStore = await this.configService.getConfigStore()
    const relics = configStore.itemStore.getAllRelics()
    const randomIndex = Math.floor(Math.random() * relics.length)
    return relics[randomIndex]
  }
  async generateRandomItemFromReward() {
    const configStore = await this.configService.getConfigStore()
    const relics = configStore.itemStore.getAllRelics()
    const randomIndex = Math.floor(Math.random() * relics.length)
    return relics[randomIndex]
  }
  async generateItemFromTemplate(templateId: string) {
    const configStore = await this.configService.getConfigStore()
    return configStore.itemStore.getRelic(templateId)
  }
}
