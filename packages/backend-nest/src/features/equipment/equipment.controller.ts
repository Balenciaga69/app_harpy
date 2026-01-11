import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

import { EquipmentService } from './equipment.service'
@Controller('api/run/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Post('equip')
  @ApiOperation({ summary: '蝛蹂??' })
  equipRelic(@Body() dto: { runId: string; relicId: string }): {
    success: boolean
    data: { message: string; relicId: string }
  } {
    return this.equipmentService.equipRelic(dto.relicId)
  }
  @Post('unequip')
  @ApiOperation({ summary: '?思??' })
  unequipRelic(@Body() dto: { runId: string; relicId: string }): {
    success: boolean
    data: { message: string; relicId: string }
  } {
    return this.equipmentService.unequipRelic(dto.relicId)
  }
}
