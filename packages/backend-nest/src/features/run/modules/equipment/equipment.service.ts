import { Injectable, BadRequestException, Optional } from '@nestjs/common'
import { EquipmentService } from 'src/from-game-core'

/**
 * 裝備服務
 * 職責：處理裝備相關的業務邏輯
 */
@Injectable()
export class EquipmentNestService {
  constructor(@Optional() private readonly equipmentService: EquipmentService) {}

  /**
   * 裝備物品
   */
  equipItem(itemId: string) {
    if (!this.equipmentService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    // TODO: 實現裝備邏輯
    return {
      success: true,
      message: '裝備成功',
      data: { itemId },
    }
  }

  /**
   * 卸下裝備
   */
  unequipItem(itemId: string) {
    if (!this.equipmentService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    // TODO: 實現卸下邏輯
    return {
      success: true,
      message: '卸下成功',
      data: { itemId },
    }
  }
}
