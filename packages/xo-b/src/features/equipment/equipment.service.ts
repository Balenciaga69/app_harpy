import { Injectable } from '@nestjs/common'
import { EquipmentService as GameCoreEquipmentService } from 'src/from-xo-c'
import { ResultToExceptionMapper } from 'src/features/shared/mappers/result-to-exception-mapper'
@Injectable()
export class EquipmentService {
  constructor(private readonly gameCoreEquipmentService: GameCoreEquipmentService) {}
  equipRelic(relicId: string): { success: boolean; data: { message: string; relicId: string } } {
    const result = this.gameCoreEquipmentService.equipRelicAndUpdateContexts(relicId)
    ResultToExceptionMapper.throwIfFailure(result)
    return {
      success: true,
      data: {
        message: '?蝛蹂???',
        relicId,
      },
    }
  }
  unequipRelic(relicId: string): { success: boolean; data: { message: string; relicId: string } } {
    const result = this.gameCoreEquipmentService.unequipRelicAndUpdateContexts(relicId)
    ResultToExceptionMapper.throwIfFailure(result)
    return {
      success: true,
      data: {
        message: '??思???',
        relicId,
      },
    }
  }
}
