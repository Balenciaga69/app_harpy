import { Controller, Post, Body } from '@nestjs/common'
import { ApiOperation, ApiBody } from '@nestjs/swagger'
import { EquipmentNestService } from './equipment.service'

/**
 * 裝備控制器
 * 職責：處理裝備相關的 HTTP 請求
 */
@Controller('api/run')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentNestService) {}

  /**
   * POST /api/run/equipment/equip - 裝備物品
   */
  @Post('equipment/equip')
  @ApiOperation({ summary: '裝備物品' })
  @ApiBody({
    schema: {
      example: {
        runId: 'run_abc123',
        itemId: 'item_sword_001',
      },
    },
  })
  async equipItem(@Body() dto: { runId: string; itemId: string }) {
    return this.equipmentService.equipItem(dto.itemId)
  }

  /**
   * POST /api/run/equipment/unequip - 卸下裝備
   */
  @Post('equipment/unequip')
  @ApiOperation({ summary: '卸下裝備' })
  @ApiBody({
    schema: {
      example: {
        runId: 'run_abc123',
        itemId: 'item_sword_001',
      },
    },
  })
  async unequipItem(@Body() dto: { runId: string; itemId: string }) {
    return this.equipmentService.unequipItem(dto.itemId)
  }
}
