import { I18nField } from '../../shared/models/I18nField'
import { EnemyEntity } from '../entity/Enemy'
import { IEventStageProcessor } from './StageProcessorContext'

export interface EnemyStage {
  id: string
  type: 'ELITE' | 'BOSS' | 'NORMAL'
  enemy: EnemyEntity
}

export interface EventStage {
  id: string
  type: 'EVENT'
  name: I18nField
  desc: I18nField
  processor: IEventStageProcessor
  accepted: boolean
}
