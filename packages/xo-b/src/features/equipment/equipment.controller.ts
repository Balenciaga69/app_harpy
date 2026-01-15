import { Body, Controller, Post } from '@nestjs/common'
import { EquipmentService } from './equipment.service'
@Controller('api/run/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Post('equip')
  equipRelic(@Body() dto: { runId: string; relicId: string }): {
    success: boolean
    data: { message: string; relicId: string }
  } {
    return this.equipmentService.equipRelic(dto.relicId)
  }
  @Post('unequip')
  unequipRelic(@Body() dto: { runId: string; relicId: string }): {
    success: boolean
    data: { message: string; relicId: string }
  } {
    return this.equipmentService.unequipRelic(dto.relicId)
  }
}
